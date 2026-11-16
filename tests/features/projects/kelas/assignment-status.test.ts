import { describe, expect, it } from "vitest";
import {
  canMove,
  latestFeedback,
  resubmitBlock,
  withMentorDecision,
  withResubmission,
} from "@/features/projects/kelas/assignment-status";
import { NOW, textOf } from "../helpers";
import { handedIn } from "./helpers";

const version = { version: 1, content: textOf(8), wordCount: 8, hash: "h2", frozenAt: NOW + 10 };

describe("canMove", () => {
  it("lets the mentor decide a hand-in, and the participant redo only a repair", () => {
    expect(canMove("dikumpulkan", "selesai")).toBe(true);
    expect(canMove("dikumpulkan", "perlu-perbaikan")).toBe(true);
    expect(canMove("perlu-perbaikan", "dikumpulkan")).toBe(true);
    expect(canMove("perlu-perbaikan", "selesai")).toBe(false);
    expect(canMove("selesai", "dikumpulkan")).toBe(false);
  });
});

describe("withMentorDecision", () => {
  it("logs who decided and why", () => {
    const next = withMentorDecision(handedIn(), "perlu-perbaikan", {
      now: NOW + 5,
      reason: " Tambah tokoh. ",
    });
    expect(next?.status).toBe("perlu-perbaikan");
    expect(next?.statusLog.at(-1)).toEqual({
      status: "perlu-perbaikan",
      at: NOW + 5,
      by: "mentor",
      reason: "Tambah tokoh.",
    });
  });

  it("refuses a repair that says nothing to repair", () => {
    expect(withMentorDecision(handedIn(), "perlu-perbaikan", { now: NOW })).toBeNull();
    expect(
      withMentorDecision(handedIn(), "perlu-perbaikan", { now: NOW, reason: "  " }),
    ).toBeNull();
  });

  it("accepts Selesai without a note", () => {
    expect(withMentorDecision(handedIn(), "selesai", { now: NOW })?.status).toBe("selesai");
  });

  it("refuses a decision the table does not allow", () => {
    const done = handedIn({ status: "selesai" });
    expect(withMentorDecision(done, "perlu-perbaikan", { now: NOW, reason: "x" })).toBeNull();
    const repair = handedIn({ status: "perlu-perbaikan" });
    expect(withMentorDecision(repair, "selesai", { now: NOW })).toBeNull();
  });
});

describe("latestFeedback", () => {
  it("is the mentor's latest note, never the participant's", () => {
    const work = withMentorDecision(handedIn(), "perlu-perbaikan", {
      now: NOW,
      reason: "Pangkas.",
    })!;
    expect(latestFeedback(work)).toBe("Pangkas.");
    expect(latestFeedback(handedIn())).toBeNull();
  });
});

describe("withResubmission", () => {
  const repair = () => handedIn({ status: "perlu-perbaikan" });
  const input = {
    version,
    source: "teks" as const,
    docId: null,
    docTitle: "Diketik langsung",
    now: NOW + 20,
  };

  it("adds version 2, keeps version 1 and goes back to the mentor", () => {
    const next = withResubmission(repair(), input);
    expect(next?.status).toBe("dikumpulkan");
    expect(next?.versions.map((v) => v.version)).toEqual([1, 2]);
    expect(next?.source).toBe("teks");
    expect(next?.statusLog.at(-1)).toMatchObject({ status: "dikumpulkan", by: "peserta" });
  });

  it("refuses unless a repair was asked for", () => {
    expect(resubmitBlock(handedIn())).toBe("bukan-perlu-perbaikan");
    expect(withResubmission(handedIn(), input)).toBeNull();
    expect(withResubmission(handedIn({ status: "selesai" }), input)).toBeNull();
  });
});
