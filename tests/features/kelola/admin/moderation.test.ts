import { beforeEach, describe, expect, it } from "vitest";
import {
  moderation,
  reports,
  fileReport,
  SEED_REPORTS,
  type ModerationEntry,
  type Report,
} from "@/features/community/moderation/report-store";
import { contentState, removedIds } from "@/features/community/moderation/removed";
import { decideCase } from "@/features/kelola/admin/moderation/moderation-actions";
import {
  allowedDecisions,
  applyCaseFilter,
  buildCases,
  contentOf,
  countCases,
  parseCaseFilter,
} from "@/features/kelola/admin/moderation/moderation-model";
import { suspensions } from "@/features/kelola/admin/role-store";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { ME_ID } from "@/features/kelola/identity";

const report = (over: Partial<Report> = {}): Report => ({
  kind: "post",
  targetId: "p1",
  reporterId: "a",
  reason: "spam",
  at: 100,
  ...over,
});
const entry = (over: Partial<ModerationEntry>): ModerationEntry => ({
  kind: "post",
  targetId: "p1",
  decision: "abaikan",
  by: "m",
  at: 200,
  ...over,
});

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  reports.reset();
  moderation.reset();
  suspensions.reset();
  auditLog.reset();
});

describe("filing reports", () => {
  it("merges a second report from the same person on the same content", () => {
    reports.write([]);
    expect(fileReport("post", "p1", "a", "spam")).toBe(true);
    expect(fileReport("post", "p1", "a", "hate")).toBe(false);
    expect(fileReport("post", "p1", "b", "hate")).toBe(true);
    expect(fileReport("comment", "p1", "a", "hate")).toBe(true);
    expect(reports.read()).toHaveLength(3);
  });

  it("starts an untouched device with the example reports", () => {
    expect(reports.read()).toEqual(SEED_REPORTS);
  });
});

describe("content state", () => {
  it("follows the last decision about visibility and ignores suspending", () => {
    expect(contentState([], "post", "p1")).toBe("tampil");
    expect(contentState([entry({ decision: "sembunyikan" })], "post", "p1")).toBe("disembunyikan");
    expect(
      contentState(
        [entry({ decision: "sembunyikan" }), entry({ decision: "tangguhkan", at: 300 })],
        "post",
        "p1",
      ),
    ).toBe("disembunyikan");
    expect(
      contentState(
        [entry({ decision: "sembunyikan" }), entry({ decision: "pulihkan", at: 300 })],
        "post",
        "p1",
      ),
    ).toBe("tampil");
  });

  it("keeps deleted content deleted", () => {
    const list = [entry({ decision: "hapus" }), entry({ decision: "pulihkan", at: 300 })];
    expect(contentState(list, "post", "p1")).toBe("dihapus");
    expect(removedIds(list).posts.has("p1")).toBe(true);
  });

  it("lists hidden posts and comments separately", () => {
    const set = removedIds([
      entry({ decision: "sembunyikan" }),
      entry({ kind: "comment", targetId: "c1", decision: "hapus" }),
    ]);
    expect([...set.posts]).toEqual(["p1"]);
    expect([...set.comments]).toEqual(["c1"]);
  });
});

describe("cases", () => {
  it("merges reports on one content and counts reasons, not people", () => {
    const rows = buildCases(
      [report(), report({ reporterId: "b", reason: "hate", at: 150 }), report({ reporterId: "c" })],
      [],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ reports: 3, topReason: "spam", status: "baru", since: 100 });
    expect(JSON.stringify(rows[0])).not.toContain('"b"');
  });

  it("is new while a report is newer than the last decision", () => {
    const decided = buildCases([report()], [entry({})]);
    expect(decided[0]).toMatchObject({ status: "selesai", state: "tampil" });
    const again = buildCases([report(), report({ reporterId: "b", at: 300 })], [entry({})]);
    expect(again[0]).toMatchObject({ status: "baru", since: 300 });
  });

  it("puts the case waiting longest first, and closed ones after", () => {
    const rows = buildCases(
      [
        report({ targetId: "new-late", at: 500 }),
        report({ targetId: "new-early", at: 100 }),
        report({ targetId: "done", at: 50 }),
      ],
      [entry({ targetId: "done", at: 60 })],
    );
    expect(rows.map((r) => r.targetId)).toEqual(["new-early", "new-late", "done"]);
    expect(countCases(rows)).toEqual({ baru: 2, selesai: 1, semua: 3 });
    expect(applyCaseFilter(rows, "selesai").map((r) => r.targetId)).toEqual(["done"]);
    expect(parseCaseFilter("zzz")).toBe("baru");
  });

  it("allows what is still possible: nothing but the author once deleted", () => {
    expect(allowedDecisions("tampil")).toEqual(["abaikan", "sembunyikan", "hapus", "tangguhkan"]);
    expect(allowedDecisions("disembunyikan")).toEqual(["pulihkan", "hapus", "tangguhkan"]);
    expect(allowedDecisions("dihapus")).toEqual(["tangguhkan"]);
  });

  it("finds the content of a post and of a comment", () => {
    const post = {
      id: "p1",
      authorId: "x",
      title: "Judul",
      blocks: [{ type: "paragraph" as const, text: "Isi." }],
    };
    const comment = { id: "c1", postId: "p1", authorId: "y", text: "Halo", createdAt: 1 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts = [post] as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = [comment] as any;
    expect(contentOf("post", "p1", posts, comments)).toMatchObject({ authorId: "x", text: "Isi." });
    expect(contentOf("comment", "c1", posts, comments)).toMatchObject({
      authorId: "y",
      title: "Judul",
      text: "Halo",
    });
    expect(contentOf("post", "zz", posts, comments)).toBeNull();
  });
});

describe("deciding a case", () => {
  const as = (roles: string) => sessionStorage.setItem("rm-roles", roles);
  const seed = () => reports.write([report({ targetId: "toples-kerupuk" })]);

  it("refuses everyone who is not a platform admin", () => {
    seed();
    as("editor");
    expect(decideCase("post", "toples-kerupuk", "laras", "abaikan")).toMatchObject({ ok: false });
    expect(moderation.read()).toEqual([]);
  });

  it("refuses content that was never reported", () => {
    as("administrator");
    expect(decideCase("post", "tidak-ada", "laras", "abaikan")).toMatchObject({ ok: false });
  });

  it("asks for a reason to hide, hides, and writes the audit", () => {
    seed();
    as("administrator");
    expect(decideCase("post", "toples-kerupuk", "laras", "sembunyikan")).toMatchObject({
      ok: false,
    });
    expect(decideCase("post", "toples-kerupuk", "laras", "sembunyikan", "Spam jelas").ok).toBe(
      true,
    );
    expect(contentState(moderation.read(), "post", "toples-kerupuk")).toBe("disembunyikan");
    expect(auditLog.read()).toMatchObject([
      {
        action: "content.hide",
        actorId: ME_ID,
        targetId: "laras",
        ref: "post:toples-kerupuk",
        reason: "Spam jelas",
      },
    ]);
  });

  it("ignores a report without a reason and restores hidden content", () => {
    seed();
    as("administrator");
    expect(decideCase("post", "toples-kerupuk", "laras", "abaikan").ok).toBe(true);
    expect(decideCase("post", "toples-kerupuk", "laras", "pulihkan")).toMatchObject({ ok: false });
    decideCase("post", "toples-kerupuk", "laras", "sembunyikan", "x");
    expect(decideCase("post", "toples-kerupuk", "laras", "pulihkan").ok).toBe(true);
    expect(auditLog.read().map((e) => e.action)).toEqual([
      "report.dismiss",
      "content.hide",
      "content.restore",
    ]);
  });

  it("cannot restore what was deleted", () => {
    seed();
    as("administrator");
    expect(decideCase("post", "toples-kerupuk", "laras", "hapus", "Melanggar").ok).toBe(true);
    expect(decideCase("post", "toples-kerupuk", "laras", "pulihkan")).toMatchObject({ ok: false });
    expect(contentState(moderation.read(), "post", "toples-kerupuk")).toBe("dihapus");
  });

  it("suspends the author through the account rules, and records nothing when that is refused", () => {
    seed();
    as("administrator");
    expect(decideCase("post", "toples-kerupuk", ME_ID, "tangguhkan", "Berulang")).toMatchObject({
      ok: false,
    });
    expect(moderation.read()).toEqual([]);
    expect(decideCase("post", "toples-kerupuk", "laras", "tangguhkan", "Berulang").ok).toBe(true);
    expect(suspensions.read().map((s) => s.userId)).toEqual(["laras"]);
    expect(moderation.read()).toMatchObject([{ decision: "tangguhkan" }]);
    expect(auditLog.read().map((e) => e.action)).toEqual(["account.suspend"]);
  });
});
