import { describe, expect, it } from "vitest";
import { emptyLog, totalWords } from "@/features/studio/daily-progress";
import {
  applyClassification,
  applyMeta,
  commitSave,
  type StudioDocument,
} from "@/features/studio/storage/document-store";

const content = { type: "doc", content: [] };
const input = { id: "a", title: "Judul", content, wordCount: 120 };

function stored(over: Partial<StudioDocument> = {}): StudioDocument {
  return { ...input, version: 3, updatedAt: 1, ...over };
}

describe("commitSave: document targets", () => {
  const targets = [{ id: "t1", words: 1000, due: "2026-12-01" }];

  it("stores the targets sent with the text and keeps them when a later save sends none", () => {
    const first = commitSave(null, { ...input, targets }, 0, emptyLog(), 100);
    expect(first.ok && first.doc.targets).toEqual(targets);
    if (!first.ok) return;

    const later = commitSave(first.doc, { ...input, wordCount: 130 }, 1, emptyLog(), 200);
    expect(later.ok && later.doc.targets).toEqual(targets);
  });

  it("does not change the day's word log", () => {
    const withTargets = commitSave(null, { ...input, targets }, 0, emptyLog(), 100);
    const without = commitSave(null, input, 0, emptyLog(), 100);
    expect(withTargets.ok && withTargets.progress).toEqual(without.ok && without.progress);
  });
});

describe("commitSave: folder", () => {
  it("files a new document in the folder but never moves an existing one", () => {
    const first = commitSave(null, { ...input, folderId: "f1" }, 0, emptyLog(), 100);
    expect(first.ok && first.doc.folderId).toBe("f1");
    if (!first.ok) return;

    const later = commitSave(first.doc, { ...input, folderId: "other" }, 1, emptyLog(), 200);
    expect(later.ok && later.doc.folderId).toBe("f1");
  });
});

describe("applyClassification", () => {
  const classification = { kind: "cerpen", tags: ["Hujan"] } as const;

  it("keeps the latest text, folder, target and version, and survives the next autosave", () => {
    const latest = stored({
      version: 4,
      folderId: "f1",
      wordCount: 130,
      updatedAt: 200,
      targets: [{ id: "t1", words: 500, due: null }],
    });
    const result = applyClassification(
      latest,
      {},
      { ...classification, tags: [...classification.tags] },
    );
    expect(result).toEqual({ status: "saved", doc: { ...latest, ...classification } });
    if (result.status !== "saved") return;
    const saved = commitSave(result.doc, { ...input, wordCount: 140 }, 4, emptyLog(), 300);
    expect(saved.ok && saved.doc).toMatchObject({ ...classification, wordCount: 140, version: 5 });
    expect(saved.ok && totalWords(saved.progress)).toBe(10);
  });

  it("rejects stale metadata without overwriting it and never writes to Sampah", () => {
    const current = stored({ kind: "puisi", tags: ["Hujan"] });
    expect(applyClassification(current, {}, { kind: "esai" })).toEqual({
      status: "conflict",
      doc: current,
    });
    expect(applyClassification({ ...current, deletedAt: 20 }, current, {})).toEqual({
      status: "unavailable",
    });
    expect(applyClassification(null, current, {})).toEqual({ status: "unavailable" });
  });

  it("clears classification and rejects duplicate tags at the write boundary", () => {
    const current = stored({ kind: "puisi", tags: ["Hujan"] });
    expect(applyClassification(current, current, {})).toEqual({
      status: "saved",
      doc: { ...current, kind: undefined, tags: [] },
    });
    expect(applyClassification(current, current, { tags: ["Hujan", "HUJAN"] })).toEqual({
      status: "invalid",
    });
  });
});

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

describe("commitSave: writing metrics", () => {
  const hour = 23;
  const previous = stored();
  const shorter = { ...input, wordCount: 115 };

  it("records net reduction even when the removed words were written on an older day", () => {
    const result = commitSave(previous, shorter, 3, emptyLog(), 300, { hour });
    expect(result.ok && result.progress.activity).toEqual({
      wordsReduced: 5,
      wordsAddedByHour: {},
    });
    expect(result.ok && totalWords(result.progress)).toBe(0);
  });

  it("records additions in the account hour and a same-size save contributes zero reduction", () => {
    const result = commitSave(previous, { ...input, wordCount: 122 }, 3, emptyLog(), 300, { hour });
    expect(result.ok && result.progress.activity).toEqual({
      wordsReduced: 0,
      wordsAddedByHour: { 23: 2 },
    });
    const replacement = commitSave(previous, input, 3, emptyLog(), 300, { hour });
    expect(replacement.ok && replacement.progress.activity?.wordsReduced).toBe(0);
  });

  it("excludes a restored version and measures only typing after the restore", () => {
    const restore = commitSave(previous, shorter, 3, emptyLog(), 300, {
      hour,
      activityBaseWords: 115,
    });
    expect(restore.ok && restore.progress.activity).toBeUndefined();
    const edited = commitSave(previous, { ...shorter, wordCount: 114 }, 3, emptyLog(), 300, {
      hour,
      activityBaseWords: 115,
    });
    expect(edited.ok && edited.progress.activity?.wordsReduced).toBe(1);
  });

  it("does not record rejected saves or saves that reconcile a conflict", () => {
    expect(commitSave(previous, shorter, 2, emptyLog(), 300, { hour })).toEqual({
      ok: false,
      conflict: previous,
    });
    const result = commitSave(previous, shorter, 3, emptyLog(), 300, {
      hour,
      activityBaseWords: null,
    });
    expect(result.ok && result.progress.activity).toBeUndefined();
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
