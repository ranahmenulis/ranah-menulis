import { describe, expect, it } from "vitest";
import { emptyLog, totalWords } from "@/features/studio/daily-progress";
import {
  applyMeta,
  commitSave,
  type StudioDocument,
} from "@/features/studio/storage/document-store";

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

describe("commitSave keeps filing state", () => {
  it("does not drop the folder or trash state when the text is saved", () => {
    const existing = stored({ folderId: "f1", deletedAt: 50 });

    const result = commitSave(existing, input, 3, emptyLog(), 9);

    expect(result.ok && result.doc.folderId).toBe("f1");
    expect(result.ok && result.doc.deletedAt).toBe(50);
  });
});

describe("applyMeta", () => {
  it("changes only the given fields, bumps the version, and keeps the content", () => {
    const doc = stored();

    const next = applyMeta(doc, { title: "Baru", deletedAt: 7 }, 99);

    expect(next).toMatchObject({ title: "Baru", deletedAt: 7, version: 4, updatedAt: 99 });
    expect(next.content).toBe(doc.content);
    expect(doc.title).toBe("Judul");
  });
});
