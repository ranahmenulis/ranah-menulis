import { describe, expect, it } from "vitest";
import type { AuditEntry } from "@/features/kelola/audit/audit-log";
import { auditSentence } from "@/features/kelola/audit/audit-text";
import { kelolaAudit as auditEn } from "@/features/kelola/audit/copy/en";
import { kelolaAudit as auditId } from "@/features/kelola/audit/copy/id";
import { kelolaJuri as juriEn } from "@/features/kelola/juri/copy/en";
import { kelolaJuri as juriId } from "@/features/kelola/juri/copy/id";
import {
  judgeRows,
  judgingLabel,
  scoreText,
  validateScores,
} from "@/features/kelola/juri/judge-model";

const keys = (value: unknown, prefix = ""): string[] =>
  typeof value === "object" && value !== null
    ? Object.entries(value).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
    : [prefix];

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(",");

function leaves(value: unknown, prefix = ""): [string, string][] {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value as object).flatMap(([k, v]) => leaves(v, `${prefix}${k}.`));
}

describe("kelola judge and audit dictionaries", () => {
  it("has the same keys and placeholders in both languages", () => {
    expect(keys(juriEn)).toEqual(keys(juriId));
    expect(keys(auditEn)).toEqual(keys(auditId));
    for (const [id, en] of [
      [juriId, juriEn],
      [auditId, auditEn],
    ] as const) {
      const english = new Map(leaves(en));
      for (const [key, text] of leaves(id)) {
        expect(placeholders(english.get(key) ?? ""), key).toBe(placeholders(text));
      }
    }
  });
});

describe("judge helpers", () => {
  const criteria = [{ name: "Theme", weight: 100 }];

  it("translates score errors and keeps Indonesian by default", () => {
    expect(validateScores(criteria, { Theme: "x" }, "").errors.Theme).toBe(
      "Isi angka bulat 1 sampai 10.",
    );
    expect(validateScores(criteria, { Theme: "x" }, "", "en").errors.Theme).toBe(
      "Enter a whole number from 1 to 10.",
    );
    expect(validateScores(criteria, { Theme: "5" }, "a".repeat(1001), "en").errors.note).toBe(
      "The note can be at most 1,000 characters.",
    );
  });

  it("formats scores and judging text by language", () => {
    expect(scoreText(7.5)).toBe("7,5");
    expect(scoreText(7.5, "en")).toBe("7.5");
    expect(judgingLabel("ditutup")).toBe("Penilaian ditutup. Skor tidak bisa diubah lagi.");
    expect(judgingLabel("ditutup", "en")).toBe(
      "Judging is closed. Scores can no longer be changed.",
    );
  });

  it("labels anonymous works by language", () => {
    const works = [{ id: "a", title: "T", genre: "Cerpen", versions: [] }] as never;
    expect(judgeRows(works, [], "me")[0].label).toBe("Karya 1");
    expect(judgeRows(works, [], "me", "en")[0].label).toBe("Work 1");
  });
});

describe("audit sentences", () => {
  const base: AuditEntry = { id: "1", at: 1, actorId: "", action: "role.grant", role: "juri" };

  it("renders Indonesian by default", () => {
    expect(auditSentence({ ...base, action: "contest.reopen", slug: "lomba-x" })).toBe(
      "Administrator membuka kembali penilaian lomba lomba-x.",
    );
  });

  it("renders English with role names and labels", () => {
    expect(auditSentence({ ...base, action: "contest.reopen", slug: "lomba-x" }, "en")).toBe(
      "Administrator reopened judging for contest lomba-x.",
    );
    expect(auditSentence({ ...base, action: "pick.add", label: "Hujan" }, "en")).toBe(
      'Administrator added "Hujan" to Editor\'s Picks.',
    );
    expect(
      auditSentence(
        { ...base, action: "content.hide", targetId: "unknown", ref: "comment:1" },
        "en",
      ),
    ).toBe("Administrator hid the comment by unknown.");
  });

  it("covers every action in both languages", () => {
    expect(Object.keys(auditEn.sentences).sort()).toEqual(Object.keys(auditId.sentences).sort());
  });
});
