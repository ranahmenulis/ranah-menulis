import { describe, expect, it } from "vitest";
import { emptyLog } from "@/features/studio/daily-progress";
import { changeDocumentArchive, copyActiveDocument } from "@/features/studio/document-archive";
import {
  archived,
  documentTagOptions,
  listEntries,
  pickLastDocument,
  trashed,
} from "@/features/studio/documents";
import { commitSave, type StudioDocument } from "@/features/studio/storage/document-store";

const source: StudioDocument = {
  id: "original",
  title: "Judul",
  content: { type: "doc", content: [{ type: "paragraph" }] },
  version: 4,
  updatedAt: 10,
  wordCount: 12,
  folderId: "folder",
  kind: "cerpen",
  tags: ["Hujan"],
  targets: [{ id: "goal", words: 200, due: null }],
};

describe("Studio document archives", () => {
  it("archives existing documents without changing their content, metadata, or save version", () => {
    expect(changeDocumentArchive(source, true, 20, true)).toEqual({
      ...source,
      archivedAt: 20,
    });
    const stored = { ...source, archivedAt: 20 };
    const saved = commitSave(stored, { ...source, title: "From an open tab" }, 4, emptyLog(), 30);
    expect(saved.ok && saved.doc).toMatchObject({
      archivedAt: 20,
      title: "From an open tab",
      version: 5,
    });
  });

  it("restores to the original folder or to the top level when the folder is gone", () => {
    const stored = { ...source, archivedAt: 20 };
    expect(changeDocumentArchive(stored, false, 30, true)).toEqual({
      ...source,
      archivedAt: null,
    });
    expect(changeDocumentArchive(stored, false, 30, false)).toMatchObject({
      folderId: null,
      archivedAt: null,
      version: 4,
    });
  });

  it("refuses stale archive operations, with Sampah taking precedence", () => {
    const trash = { ...source, archivedAt: 20, deletedAt: 30 };
    expect(changeDocumentArchive(source, false, 20, true)).toBeNull();
    expect(changeDocumentArchive({ ...source, archivedAt: 20 }, true, 30, true)).toBeNull();
    expect(changeDocumentArchive(trash, false, 40, true)).toBeNull();
    expect(changeDocumentArchive(undefined, true, 40, true)).toBeNull();
    expect(archived([trash])).toEqual([]);
    expect(trashed([trash])).toEqual([trash]);
  });

  it("excludes archived documents from active folder counts, tags, and the resume shortcut", () => {
    const stored = { ...source, archivedAt: 20, updatedAt: 50 };
    const active = { ...source, id: "active", folderId: null, tags: ["Pagi"] };
    const docs = [stored, active];
    const folders = [{ id: "folder", name: "Folder", createdAt: 2 }];
    expect(listEntries(docs, folders, "folder")).toEqual([]);
    expect(listEntries(docs, folders, null)[0]).toMatchObject({ count: 0, changedAt: 2 });
    expect(documentTagOptions(docs, null)).toEqual([["pagi", "Pagi"]]);
    expect(pickLastDocument(docs)).toEqual(active);
    expect(archived(docs)).toEqual([stored]);
  });
});

describe("Studio document duplication", () => {
  it("copies writing and classification without carrying targets or archive and trash flags", () => {
    expect(copyActiveDocument(source, "copy", 20)).toStrictEqual({
      id: "copy",
      title: "Judul (salinan)",
      content: source.content,
      wordCount: 12,
      folderId: "folder",
      kind: "cerpen",
      tags: ["Hujan"],
      version: 1,
      updatedAt: 20,
    });
  });

  it("refuses an unavailable source and gives an untitled copy a usable name", () => {
    expect(copyActiveDocument({ ...source, title: " " }, "copy", 20)?.title).toBe(
      "Tanpa judul (salinan)",
    );
    expect(copyActiveDocument({ ...source, archivedAt: 21 }, "copy", 22)).toBeNull();
    expect(copyActiveDocument({ ...source, deletedAt: 21 }, "copy", 22)).toBeNull();
    expect(copyActiveDocument(undefined, "copy", 22)).toBeNull();
  });
});
