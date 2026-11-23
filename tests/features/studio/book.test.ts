import { describe, expect, it } from "vitest";
import {
  bookWords,
  chaptersOf,
  coverOf,
  moveChapter,
  orderChapters,
  validateBook,
} from "@/features/studio/book";
import { listEntries } from "@/features/studio/documents";
import {
  applyFolderPatch,
  commitSave,
  type DocumentSummary,
  type StudioFolder,
} from "@/features/studio/storage/document-store";
import { emptyLog } from "@/features/studio/daily-progress";

const doc = (id: string, over: Partial<DocumentSummary> = {}): DocumentSummary => ({
  id,
  title: id,
  wordCount: 100,
  version: 1,
  updatedAt: 1,
  folderId: "b",
  ...over,
});
const book = (over: Partial<StudioFolder> = {}): StudioFolder => ({
  id: "b",
  name: "Novel",
  createdAt: 0,
  kind: "book",
  ...over,
});

describe("orderChapters", () => {
  it("follows the saved order and puts new chapters last by creation time", () => {
    const docs = [
      doc("new2", { createdAt: 30 }),
      doc("a", { createdAt: 1 }),
      doc("new1", { createdAt: 20 }),
      doc("b", { createdAt: 2 }),
    ];
    expect(orderChapters(docs, ["b", "a"]).map((d) => d.id)).toEqual(["b", "a", "new1", "new2"]);
  });

  it("skips ids that are gone, repeated or not text", () => {
    const docs = [doc("a"), doc("b")];
    expect(orderChapters(docs, ["x", "b", "b", 7, "a"]).map((d) => d.id)).toEqual(["b", "a"]);
    expect(orderChapters(docs, "nonsense").map((d) => d.id)).toEqual(["a", "b"]);
  });

  it("is stable for documents saved before creation times existed", () => {
    const docs = [doc("z", { updatedAt: 1 }), doc("a", { updatedAt: 99 })];
    expect(orderChapters(docs, undefined).map((d) => d.id)).toEqual(["a", "z"]);
  });
});

describe("moveChapter", () => {
  it("swaps with the neighbour and stops at the ends", () => {
    expect(moveChapter(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
    expect(moveChapter(["a", "b", "c"], "b", 1)).toEqual(["a", "c", "b"]);
    expect(moveChapter(["a", "b"], "a", -1)).toBeNull();
    expect(moveChapter(["a", "b"], "b", 1)).toBeNull();
    expect(moveChapter(["a"], "zz", 1)).toBeNull();
  });
});

describe("book chapters and words", () => {
  it("counts only active documents of the book", () => {
    const docs = [
      doc("a", { wordCount: 300 }),
      doc("b", { wordCount: 200, deletedAt: 5 }),
      doc("c", { wordCount: 50, archivedAt: 5 }),
      doc("d", { wordCount: 70, folderId: "other" }),
    ];
    const chapters = chaptersOf(docs, "b");
    expect(chapters.map((d) => d.id)).toEqual(["a"]);
    expect(bookWords(chapters)).toBe(300);
  });
});

describe("listEntries in a book", () => {
  const docs = [doc("a", { updatedAt: 9, createdAt: 1 }), doc("b", { updatedAt: 1, createdAt: 2 })];

  it("lists chapters in reading order, not by last change", () => {
    const entries = listEntries(docs, [book({ chapterOrder: ["b", "a"] })], "b");
    expect(entries.map((e) => (e.kind === "document" ? e.doc.id : ""))).toEqual(["b", "a"]);
  });

  it("keeps the newest-first order in a plain folder", () => {
    const entries = listEntries(docs, [book({ kind: undefined, chapterOrder: ["b", "a"] })], "b");
    expect(entries.map((e) => (e.kind === "document" ? e.doc.id : ""))).toEqual(["a", "b"]);
  });

  it("gives the folder row its total words", () => {
    const [entry] = listEntries(docs, [book()], null);
    expect(entry).toMatchObject({ kind: "folder", count: 2, words: 200 });
  });
});

describe("coverOf and applyFolderPatch", () => {
  it("only trusts a well formed cover on a book", () => {
    const cover = { fileId: "f1", alt: "Sampul" };
    expect(coverOf(book({ cover }))).toEqual(cover);
    expect(coverOf(book({ kind: undefined, cover }))).toBeNull();
    expect(coverOf(book({ cover: { fileId: "", alt: "x" } }))).toBeNull();
    expect(coverOf(book({ cover: { fileId: "f", alt: 3 } as never }))).toBeNull();
  });

  it("sets, replaces and removes the cover without touching the rest", () => {
    const base = book({ chapterOrder: ["a"] });
    const set = applyFolderPatch(base, { cover: { fileId: "f", alt: "x" } });
    expect(set.cover).toEqual({ fileId: "f", alt: "x" });
    const removed = applyFolderPatch(set, { cover: null });
    expect(removed).not.toHaveProperty("cover");
    expect(removed.chapterOrder).toEqual(["a"]);
    expect(applyFolderPatch(base, { name: "Baru" }).name).toBe("Baru");
  });
});

describe("validateBook", () => {
  it("needs a title and a description for a cover", () => {
    expect(validateBook("  ", null)).toBe("titleRequired");
    expect(validateBook("x".repeat(121), null)).toBe("titleTooLong");
    expect(validateBook("Novel", { fileId: "f", alt: " " })).toBe("altRequired");
    expect(validateBook("Novel", { fileId: "f", alt: "x".repeat(201) })).toBe("altTooLong");
    expect(validateBook("Novel", { fileId: "f", alt: "Sampul biru" })).toBeNull();
    expect(validateBook("Novel", null)).toBeNull();
  });
});

describe("commitSave: createdAt", () => {
  const input = { id: "a", title: "T", content: { type: "doc", content: [] }, wordCount: 1 };
  it("stamps the first save only", () => {
    const first = commitSave(null, input, 0, emptyLog(), 100);
    expect(first.ok && first.doc.createdAt).toBe(100);
    if (!first.ok) return;
    const later = commitSave(first.doc, input, 1, emptyLog(), 200);
    expect(later.ok && later.doc.createdAt).toBe(100);
  });
});
