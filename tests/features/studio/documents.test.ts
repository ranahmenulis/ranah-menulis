import { describe, expect, it } from "vitest";
import { listEntries, trashed } from "@/features/studio/documents";
import type { StudioDocument, StudioFolder } from "@/features/studio/storage/document-store";

const content = { type: "doc" };
const doc = (id: string, over: Partial<StudioDocument> = {}): StudioDocument => ({
  id,
  title: id,
  content,
  wordCount: 1,
  version: 1,
  updatedAt: 1,
  ...over,
});
const folder = (id: string, name = id): StudioFolder => ({ id, name, createdAt: 0 });

describe("listEntries", () => {
  const docs = [
    doc("old", { updatedAt: 10 }),
    doc("new", { updatedAt: 90 }),
    doc("filed", { updatedAt: 50, folderId: "f1" }),
    doc("gone", { updatedAt: 99, deletedAt: 5 }),
  ];

  it("lists folders first, then loose documents newest first, never trashed ones", () => {
    const entries = listEntries(docs, [folder("f1", "Cerpen")], null);
    expect(entries.map((e) => (e.kind === "folder" ? `folder:${e.folder.id}` : e.doc.id))).toEqual([
      "folder:f1",
      "new",
      "old",
    ]);
  });

  it("counts only live documents in a folder and reports its latest change", () => {
    const entries = listEntries(
      [...docs, doc("filed2", { folderId: "f1", deletedAt: 3, updatedAt: 200 })],
      [folder("f1")],
      null,
    );
    const first = entries[0];
    expect(first.kind === "folder" && first.count).toBe(1);
    expect(first.kind === "folder" && first.changedAt).toBe(50);
  });

  it("shows only that folder's documents when inside it", () => {
    const entries = listEntries(docs, [folder("f1")], "f1");
    expect(entries.map((e) => e.kind === "document" && e.doc.id)).toEqual(["filed"]);
  });

  it("is empty for no documents at all", () => {
    expect(listEntries([], [], null)).toEqual([]);
  });

  it("sorts folders by name", () => {
    const entries = listEntries([], [folder("b", "Zebra"), folder("a", "Antologi")], null);
    expect(entries.map((e) => e.kind === "folder" && e.folder.name)).toEqual(["Antologi", "Zebra"]);
  });
});

describe("trashed", () => {
  it("returns trashed documents, most recently trashed first", () => {
    const list = trashed([doc("a", { deletedAt: 5 }), doc("b"), doc("c", { deletedAt: 9 })]);
    expect(list.map((d) => d.id)).toEqual(["c", "a"]);
  });
});
