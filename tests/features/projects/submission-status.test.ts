import { describe, expect, it } from "vitest";
import {
  canMove,
  canWithdraw,
  latestFeedback,
  MAX_REVISIONS,
  REVISION_DAYS,
  reviseBlock,
  revisionDueAt,
  revisionsSent,
  withDecision,
  withRevision,
  withWithdrawal,
} from "@/features/projects/submission-status";
import type { Submission } from "@/features/projects/submission-types";
import { NOW, submission, textOf } from "./helpers";

const DAY = 86_400_000;

/** A work the editor asked to revise at `NOW`, with `rounds` revisions already sent before. */
function needsRevision(rounds = 0): Submission {
  const log: Submission["statusLog"] = [{ status: "terkirim", at: NOW - 9 * DAY, by: "sistem" }];
  for (let i = 0; i < rounds; i++) {
    log.push({ status: "revisi-terkirim", at: NOW - 5 * DAY + i, by: "peserta" });
  }
  log.push({
    status: "perlu-revisi",
    at: NOW,
    by: "editor",
    reason: "Perkuat paragraf pembuka.",
    dueAt: NOW + REVISION_DAYS * DAY,
  });
  return submission({ status: "perlu-revisi", statusLog: log });
}

const revision = {
  content: textOf(7),
  wordCount: 7,
  hash: "h2",
  docId: "d1",
  docTitle: "Esai",
  note: "",
};

describe("the transition table (PRD 10.5)", () => {
  it("follows each row of the table", () => {
    expect(canMove("terkirim", "peninjauan")).toBe(true);
    expect(canMove("peninjauan", "perlu-revisi")).toBe(true);
    expect(canMove("perlu-revisi", "revisi-terkirim")).toBe(true);
    expect(canMove("revisi-terkirim", "peninjauan")).toBe(true);
  });

  it("does not let a status skip a step", () => {
    expect(canMove("terkirim", "diterima")).toBe(false);
    expect(canMove("terkirim", "perlu-revisi")).toBe(false);
    expect(canMove("perlu-revisi", "diterima")).toBe(false);
    expect(canMove("revisi-terkirim", "diterima")).toBe(false);
  });

  it("ends at Diterima, Ditolak and Ditarik", () => {
    for (const end of ["diterima", "ditolak", "ditarik"] as const) {
      for (const to of ["peninjauan", "perlu-revisi", "revisi-terkirim", "ditarik"] as const) {
        expect(canMove(end, to)).toBe(false);
      }
    }
  });
});

describe("withDecision", () => {
  it("moves Terkirim to Dalam Peninjauan and logs who and when", () => {
    const result = withDecision(submission(), "peninjauan", { now: NOW });
    expect(result?.status).toBe("peninjauan");
    expect(result?.statusLog.at(-1)).toEqual({ status: "peninjauan", at: NOW, by: "editor" });
    expect(result?.statusLog).toHaveLength(2);
  });

  it("asking for a revision records the note and a deadline seven days away", () => {
    const reviewing = submission({ status: "peninjauan" });
    const result = withDecision(reviewing, "perlu-revisi", { now: NOW, reason: "Pendekkan." });
    expect(result?.statusLog.at(-1)).toMatchObject({
      status: "perlu-revisi",
      reason: "Pendekkan.",
      dueAt: NOW + 7 * DAY,
    });
  });

  it("refuses a step the table does not allow, and leaves the work as it was", () => {
    const work = submission();
    expect(withDecision(work, "diterima", { now: NOW })).toBeNull();
    expect(work.status).toBe("terkirim");
    expect(work.statusLog).toHaveLength(1);
  });

  it("does not ask for another round once the limit of revisions was sent", () => {
    const reviewing = submission({
      status: "peninjauan",
      statusLog: Array.from({ length: MAX_REVISIONS }, () => ({
        status: "revisi-terkirim" as const,
        at: NOW,
        by: "peserta" as const,
      })),
    });
    expect(withDecision(reviewing, "perlu-revisi", { now: NOW })).toBeNull();
    expect(withDecision(reviewing, "diterima", { now: NOW })?.status).toBe("diterima");
  });
});

describe("what a work in Perlu Revisi says", () => {
  it("reads the deadline and the note of the latest request", () => {
    const work = needsRevision();
    expect(revisionDueAt(work)).toBe(NOW + 7 * DAY);
    expect(latestFeedback(work)).toBe("Perkuat paragraf pembuka.");
  });

  it("has no open deadline in any other status", () => {
    expect(revisionDueAt(submission())).toBeNull();
    expect(latestFeedback(submission())).toBeNull();
  });

  it("counts only the revisions the participant sent", () => {
    expect(revisionsSent(needsRevision(2))).toBe(2);
    expect(revisionsSent(submission())).toBe(0);
  });
});

describe("reviseBlock", () => {
  it("lets a revision through until its deadline", () => {
    expect(reviseBlock(needsRevision(), NOW + 7 * DAY)).toBeNull();
  });

  it("closes after the deadline, even if the project deadline is long gone", () => {
    expect(reviseBlock(needsRevision(), NOW + 7 * DAY + 1)).toBe("tenggat-lewat");
  });

  it("closes after the second revision", () => {
    expect(reviseBlock(needsRevision(MAX_REVISIONS), NOW)).toBe("putaran-habis");
    expect(reviseBlock(needsRevision(MAX_REVISIONS - 1), NOW)).toBeNull();
  });

  it("is only for a work an editor asked to revise", () => {
    expect(reviseBlock(submission(), NOW)).toBe("bukan-perlu-revisi");
    expect(reviseBlock(submission({ status: "diterima" }), NOW)).toBe("bukan-perlu-revisi");
  });
});

describe("withRevision", () => {
  it("adds version 2, keeps version 1, and records Revisi Terkirim", () => {
    const work = needsRevision();
    const result = withRevision(work, { ...revision, now: NOW + DAY, note: "Sudah diperkuat." });
    expect(result?.status).toBe("revisi-terkirim");
    expect(result?.versions.map((v) => v.version)).toEqual([1, 2]);
    expect(result?.versions[0]).toEqual(work.versions[0]);
    expect(result?.versions[1]).toMatchObject({ wordCount: 7, hash: "h2", frozenAt: NOW + DAY });
    expect(result?.statusLog.at(-1)).toEqual({
      status: "revisi-terkirim",
      at: NOW + DAY,
      by: "peserta",
      reason: "Sudah diperkuat.",
    });
  });

  it("follows the document the revision was made from", () => {
    const result = withRevision(needsRevision(), {
      ...revision,
      docId: "d9",
      docTitle: "Draf baru",
      now: NOW,
    });
    expect(result).toMatchObject({ docId: "d9", docTitle: "Draf baru" });
  });

  it("is refused when the deadline passed or no revision was asked for", () => {
    expect(withRevision(needsRevision(), { ...revision, now: NOW + 8 * DAY })).toBeNull();
    expect(withRevision(submission(), { ...revision, now: NOW })).toBeNull();
  });
});

describe("withWithdrawal", () => {
  it("withdraws a work that is Terkirim or Perlu Revisi", () => {
    for (const work of [submission(), needsRevision()]) {
      expect(canWithdraw(work)).toBe(true);
      const result = withWithdrawal(work, NOW);
      expect(result?.status).toBe("ditarik");
      expect(result?.statusLog.at(-1)).toMatchObject({ status: "ditarik", by: "peserta" });
    }
  });

  it("cannot withdraw once it is being reviewed or decided", () => {
    for (const status of [
      "peninjauan",
      "revisi-terkirim",
      "diterima",
      "ditolak",
      "ditarik",
    ] as const) {
      expect(withWithdrawal(submission({ status }), NOW)).toBeNull();
    }
  });
});
