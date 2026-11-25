import { describe, expect, it } from "vitest";
import { sameClassification } from "@/features/studio/document-classification";
import {
  documentFromRow,
  folderColumns,
  folderFromRow,
  importableFolder,
  isUuid,
  logFromJson,
  metaPatch,
  versionFromRow,
  type DocumentRow,
  type FolderRow,
} from "@/features/studio/storage/remote/row-mapping";

const row: DocumentRow = {
  id: "d1",
  folder_id: null,
  title: "Judul",
  content: { type: "doc" },
  word_count: 12,
  version: 3,
  created_at: "2026-11-01T01:00:00.123456+00:00",
  updated_at: "2026-11-02T01:00:00+00:00",
  deleted_at: null,
  archived_at: null,
  kind: null,
  tags: null,
  synopsis: null,
  cover: null,
  targets: null,
  layout: null,
};

describe("documentFromRow", () => {
  it("turns timestamps into milliseconds and keeps the three location fields explicit", () => {
    const doc = documentFromRow(row);
    expect(doc.updatedAt).toBe(Date.parse("2026-11-02T01:00:00Z"));
    expect(doc.createdAt).toBe(Date.parse("2026-11-01T01:00:00.123Z"));
    expect(doc.wordCount).toBe(12);
    expect(doc.folderId).toBeNull();
    expect(doc.deletedAt).toBeNull();
    expect(doc.archivedAt).toBeNull();
  });

  it("leaves absent optional fields undefined, so a document with no kind or tags compares equal", () => {
    const doc = documentFromRow(row);
    for (const key of ["kind", "tags", "synopsis", "cover", "targets", "layout"] as const) {
      expect(key in doc).toBe(false);
    }
    expect(sameClassification(doc, {})).toBe(true);
    const tagged = documentFromRow({ ...row, kind: "puisi", tags: ["a"] });
    expect(sameClassification(tagged, { kind: "puisi", tags: ["a"] })).toBe(true);
  });

  it("converts trash and archive times", () => {
    const doc = documentFromRow({
      ...row,
      deleted_at: "2026-11-03T00:00:00+00:00",
      archived_at: "2026-11-04T00:00:00+00:00",
    });
    expect(doc.deletedAt).toBe(Date.parse("2026-11-03T00:00:00Z"));
    expect(doc.archivedAt).toBe(Date.parse("2026-11-04T00:00:00Z"));
  });
});

describe("folders", () => {
  const folderRow: FolderRow = {
    id: "f1",
    name: "Buku",
    kind: "book",
    cover: { fileId: "x", alt: "sampul" },
    chapter_order: ["a", "b"],
    genre: "novel",
    tags: ["t"],
    synopsis: null,
    collection_id: null,
    targets: null,
    created_at: "2026-11-01T00:00:00+00:00",
  };

  it("maps a book folder both ways", () => {
    const folder = folderFromRow(folderRow);
    expect(folder).toMatchObject({
      id: "f1",
      kind: "book",
      chapterOrder: ["a", "b"],
      genre: "novel",
      createdAt: Date.parse("2026-11-01T00:00:00Z"),
    });
    expect("collectionId" in folder).toBe(false);
    expect(folderColumns(folder)).toMatchObject({ chapter_order: ["a", "b"], genre: "novel" });
  });

  it("clears a cover with null and only sends the fields that were set", () => {
    expect(folderColumns({ cover: null })).toEqual({ cover: null });
    expect(folderColumns({ name: "Baru" })).toEqual({ name: "Baru" });
    expect(folderColumns({})).toEqual({});
  });

  it("keeps id and creation time when importing", () => {
    const out = importableFolder({ id: "f1", name: "N", createdAt: 1_700_000_000_000 });
    expect(out.id).toBe("f1");
    expect(out.created_at).toBe(new Date(1_700_000_000_000).toISOString());
    expect(out.name).toBe("N");
  });
});

describe("other mappings", () => {
  it("passes only the keys set in a meta patch, including an explicit null", () => {
    expect(metaPatch({ title: "x", cover: null, synopsis: undefined })).toEqual({
      title: "x",
      cover: null,
    });
  });

  it("maps a version row", () => {
    expect(
      versionFromRow({
        id: "d1:v2",
        doc_id: "d1",
        saved_at: "2026-11-02T00:00:00+00:00",
        title: "t",
        content: { type: "doc" },
        word_count: 5,
        reason: "berkala",
      }),
    ).toMatchObject({ docId: "d1", savedAt: Date.parse("2026-11-02T00:00:00Z"), wordCount: 5 });
  });

  it("drops a null activity from a daily log", () => {
    expect(logFromJson({ day: "2026-11-02", docs: {}, activity: null })).toEqual({
      day: "2026-11-02",
      docs: {},
    });
  });

  it("recognises UUIDs and rejects the placeholder id of an unsaved document", () => {
    expect(isUuid(crypto.randomUUID())).toBe(true);
    expect(isUuid("baru")).toBe(false);
  });
});
