import { describe, expect, it } from "vitest";
import {
  buildWorks,
  collectionsOf,
  listWorks,
  nextSort,
  searchCandidates,
  sortWorks,
  workMatches,
  type Work,
} from "@/features/studio/works";
import type { DocumentSummary, StudioFolder } from "@/features/studio/storage/document-store";

const doc = (id: string, over: Partial<DocumentSummary> = {}): DocumentSummary => ({
  id,
  title: id,
  wordCount: 100,
  version: 1,
  updatedAt: 10,
  ...over,
});
const folder = (id: string, over: Partial<StudioFolder> = {}): StudioFolder => ({
  id,
  name: id,
  createdAt: 1,
  ...over,
});
const NO_FILTERS = { kind: null, tag: null };
const ids = (works: Work[]) => works.map((work) => work.id);

describe("buildWorks", () => {
  it("lists loose documents and books, and keeps chapters and plain folders out", () => {
    const works = buildWorks(
      [doc("loose"), doc("chapter", { folderId: "book" }), doc("shelved", { folderId: "shelf" })],
      [folder("book", { kind: "book" }), folder("shelf")],
    );
    expect(ids(works).sort()).toEqual(["book", "loose", "shelved"]);
    expect(works.find((work) => work.id === "shelved")?.collectionId).toBe("shelf");
    expect(works.find((work) => work.id === "loose")?.collectionId).toBeNull();
  });

  it("skips archived and trashed documents", () => {
    const works = buildWorks(
      [doc("a"), doc("b", { archivedAt: 5 }), doc("c", { deletedAt: 5 })],
      [],
    );
    expect(ids(works)).toEqual(["a"]);
  });

  it("describes a book from its chapters and its own details", () => {
    const [work] = buildWorks(
      [
        doc("c2", { folderId: "book", wordCount: 30, updatedAt: 50, createdAt: 2 }),
        doc("c1", { folderId: "book", wordCount: 20, updatedAt: 40, createdAt: 1 }),
        doc("gone", { folderId: "book", wordCount: 999, deletedAt: 9 }),
      ],
      [
        folder("book", {
          kind: "book",
          name: "Arutala",
          genre: "novel",
          tags: ["fantasi"],
          synopsis: "Sebuah kisah.",
          chapterOrder: ["c2", "c1"],
          createdAt: 3,
        }),
      ],
    );
    expect(work).toMatchObject({
      type: "book",
      title: "Arutala",
      words: 50,
      chapters: 2,
      genre: "novel",
      tags: ["fantasi"],
      synopsis: "Sebuah kisah.",
      updatedAt: 50,
      createdAt: 3,
      openId: "c2",
    });
  });

  it("gives an empty book no chapter to open and its creation time as last change", () => {
    const [work] = buildWorks([], [folder("book", { kind: "book", createdAt: 7 })]);
    expect(work).toMatchObject({ chapters: 0, words: 0, openId: null, updatedAt: 7 });
  });

  it("reads a loose document as one chapter with defaults for missing fields", () => {
    const [work] = buildWorks([doc("d", { updatedAt: 9 })], []);
    expect(work).toMatchObject({
      type: "document",
      chapters: 1,
      genre: null,
      tags: [],
      synopsis: "",
      createdAt: 9,
      openId: "d",
    });
  });

  it("files a book in a collection only if that plain folder exists", () => {
    const works = buildWorks(
      [],
      [
        folder("shelf"),
        folder("in", { kind: "book", collectionId: "shelf" }),
        folder("orphan", { kind: "book", collectionId: "missing" }),
        folder("other", { kind: "book", collectionId: "in" }),
      ],
    );
    const at = (id: string) => works.find((work) => work.id === id)?.collectionId;
    expect(at("in")).toBe("shelf");
    expect(at("orphan")).toBeNull();
    // A book is not a collection, so a book cannot hold another book.
    expect(at("other")).toBeNull();
  });
});

describe("collectionsOf", () => {
  it("returns plain folders only", () => {
    expect(
      collectionsOf([folder("shelf"), folder("book", { kind: "book" })]).map((f) => f.id),
    ).toEqual(["shelf"]);
  });
});

describe("sortWorks", () => {
  const works = buildWorks(
    [
      doc("b", { title: "Bulan", wordCount: 5, updatedAt: 1, createdAt: 3, kind: "puisi" }),
      doc("a", { title: "angin", wordCount: 50, updatedAt: 3, createdAt: 1 }),
      doc("c", { title: "Cahaya", wordCount: 20, updatedAt: 2, createdAt: 2, kind: "cerpen" }),
    ],
    [],
  );

  it("defaults to the latest change first", () => {
    expect(ids(sortWorks(works))).toEqual(["a", "c", "b"]);
  });

  it("sorts titles ignoring case, in both directions", () => {
    expect(ids(sortWorks(works, { key: "title", dir: "asc" }))).toEqual(["a", "b", "c"]);
    expect(ids(sortWorks(works, { key: "title", dir: "desc" }))).toEqual(["c", "b", "a"]);
  });

  it("sorts by words and by creation time", () => {
    expect(ids(sortWorks(works, { key: "words", dir: "desc" }))).toEqual(["a", "c", "b"]);
    expect(ids(sortWorks(works, { key: "created", dir: "asc" }))).toEqual(["a", "c", "b"]);
  });

  it("puts works without a type last in either direction", () => {
    expect(ids(sortWorks(works, { key: "genre", dir: "asc" }))).toEqual(["c", "b", "a"]);
    expect(ids(sortWorks(works, { key: "genre", dir: "desc" }))).toEqual(["b", "c", "a"]);
  });

  it("breaks ties by id so the order is stable", () => {
    const tied = buildWorks([doc("z"), doc("m")], []);
    expect(ids(sortWorks(tied))).toEqual(["m", "z"]);
  });
});

describe("nextSort", () => {
  it("flips the direction of the active column", () => {
    expect(nextSort({ key: "title", dir: "asc" }, "title")).toEqual({ key: "title", dir: "desc" });
  });

  it("starts a new column in its natural order", () => {
    expect(nextSort({ key: "title", dir: "asc" }, "updated")).toEqual({
      key: "updated",
      dir: "desc",
    });
    expect(nextSort({ key: "updated", dir: "desc" }, "title")).toEqual({
      key: "title",
      dir: "asc",
    });
  });
});

describe("listWorks", () => {
  const works = buildWorks(
    [
      doc("top", { updatedAt: 3, kind: "puisi", tags: ["Laut"] }),
      doc("inside", { updatedAt: 2, folderId: "shelf", kind: "cerpen" }),
    ],
    [folder("shelf"), folder("book", { kind: "book", collectionId: "shelf", tags: ["laut"] })],
  );

  it("shows one scope at a time", () => {
    expect(ids(listWorks(works, null, NO_FILTERS, null))).toEqual(["top"]);
    expect(ids(listWorks(works, "shelf", NO_FILTERS, null)).sort()).toEqual(["book", "inside"]);
  });

  it("looks across every collection once a filter or a search is on", () => {
    expect(ids(listWorks(works, null, { kind: "cerpen", tag: null }, null))).toEqual(["inside"]);
    expect(ids(listWorks(works, null, { kind: null, tag: "laut" }, null)).sort()).toEqual([
      "book",
      "top",
    ]);
    expect(ids(listWorks(works, null, NO_FILTERS, new Set(["inside"])))).toEqual(["inside"]);
  });

  it("stays inside a collection when filtering there", () => {
    expect(ids(listWorks(works, "shelf", { kind: "puisi", tag: null }, null))).toEqual([]);
    expect(ids(listWorks(works, "shelf", { kind: "cerpen", tag: null }, null))).toEqual(["inside"]);
  });
});

describe("searchCandidates", () => {
  const docs = [
    doc("top"),
    doc("inside", { folderId: "shelf" }),
    doc("chapter", { folderId: "book" }),
    doc("elsewhere", { folderId: "other-book" }),
    doc("archived", { archivedAt: 1 }),
  ];
  const folders = [
    folder("shelf"),
    folder("book", { kind: "book", collectionId: "shelf" }),
    folder("other-book", { kind: "book" }),
  ];

  it("reads every active document at the top level", () => {
    expect(searchCandidates(docs, folders, null).map((d) => d.id)).toEqual([
      "top",
      "inside",
      "chapter",
      "elsewhere",
    ]);
  });

  it("reads a collection's own documents and its books' chapters", () => {
    expect(searchCandidates(docs, folders, "shelf").map((d) => d.id)).toEqual([
      "inside",
      "chapter",
    ]);
  });
});

describe("workMatches", () => {
  const works = buildWorks(
    [doc("a"), doc("chapter", { folderId: "book" })],
    [folder("book", { kind: "book", name: "Arutala" })],
  );

  it("is null while there is no search", () => {
    expect(workMatches(works, null, "")).toBeNull();
  });

  it("matches a book through its chapters or its own title", () => {
    expect([...(workMatches(works, new Set(["chapter"]), "kata") ?? [])]).toEqual(["book"]);
    expect([...(workMatches(works, new Set(), "aruta") ?? [])]).toEqual(["book"]);
    expect([...(workMatches(works, new Set(["a"]), "x") ?? [])]).toEqual(["a"]);
  });
});
