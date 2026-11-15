import { describe, expect, it } from "vitest";
import { emptyLog, totalWords } from "../daily-progress";
import { commitSave, type StudioDocument } from "./document-store";

const content = { type: "doc", content: [] };
const input = { id: "a", title: "Judul", content, wordCount: 120 };

function stored(over: Partial<StudioDocument> = {}): StudioDocument {
  return { ...input, version: 3, updatedAt: 1, ...over };
}

describe("commitSave", () => {
  it("creates a document at version 1 and records today's words", () => {
    const result = commitSave(null, input, 0, emptyLog(), 100);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.doc.version).toBe(1);
    expect(result.doc.updatedAt).toBe(100);
    expect(totalWords(result.progress)).toBe(120);
  });

  it("accepts a save whose base version matches and increments it", () => {
    const result = commitSave(
      stored({ wordCount: 100 }),
      { ...input, wordCount: 130 },
      3,
      emptyLog(),
      200,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.doc.version).toBe(4);
    expect(totalWords(result.progress)).toBe(30);
  });

  it("reports a conflict, with the stored version, when the base version is stale", () => {
    const existing = stored({ version: 5, title: "Dari tab lain" });

    const result = commitSave(existing, input, 3, emptyLog(), 300);

    expect(result).toEqual({ ok: false, conflict: existing });
  });
});
