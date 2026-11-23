import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bookChapterCount,
  bookDocId,
  bookSource,
  bookSources,
  folderIdOfBook,
  isBookDocId,
} from "@/features/studio/book-source";
import type { StudioDocument, StudioFolder } from "@/features/studio/storage/document-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { sendRevision } from "@/features/projects/revise-flow";
import { sendSubmission } from "@/features/projects/submit-flow";
import { emptyForm, type SubmitForm } from "@/features/projects/submission-model";
import { readSubmitSource, submitDocs } from "@/features/projects/submit-source";
import { project, registration, textOf } from "./helpers";

const solo = project("solo-penerbitan-buku-sendiri", Date.now());
const esai = project("lomba-esai-literasi-remaja", Date.now());

const folder: StudioFolder = { id: "b", name: "Pulang ke Pesisir", createdAt: 0, kind: "book" };
const chapter = (id: string, title: string, words: number, over = {}): StudioDocument => ({
  id,
  title,
  content: textOf(words),
  wordCount: words,
  version: 1,
  updatedAt: 10,
  createdAt: Number(id.slice(2)),
  folderId: "b",
  ...over,
});
const chapters = [chapter("c1", "Pelabuhan", 11000), chapter("c2", "Pasar Ikan", 12000)];

function reader(docs: StudioDocument[] = chapters, folders: StudioFolder[] = [folder]) {
  return {
    get: vi.fn(async (id: string) => docs.find((d) => d.id === id) ?? null),
    list: vi.fn(async () => docs),
    listFolders: vi.fn(async () => folders),
  };
}

describe("bookSource", () => {
  it("merges chapters in reading order under level 1 titles and adds their words", () => {
    const source = bookSource({ ...folder, chapterOrder: ["c2", "c1"] }, chapters);
    expect(source?.chapters).toEqual([
      { title: "Pasar Ikan", words: 12000 },
      { title: "Pelabuhan", words: 11000 },
    ]);
    expect(source?.doc.wordCount).toBe(23000);
    expect(source?.doc.id).toBe("book:b");
    const nodes = source?.doc.content.content ?? [];
    expect(nodes[0]).toMatchObject({ type: "heading", attrs: { level: 1 } });
    expect(nodes.filter((n) => n.type === "heading")).toHaveLength(2);
    expect(source && bookChapterCount(source.doc)).toBe(2);
  });

  it("leaves out empty, archived, trashed and foreign documents", () => {
    const docs = [
      chapter("c1", "Satu", 100),
      chapter("c2", "Kosong", 0),
      chapter("c3", "Arsip", 50, { archivedAt: 5 }),
      chapter("c4", "Sampah", 50, { deletedAt: 5 }),
      chapter("c5", "Lain", 50, { folderId: "other" }),
    ];
    expect(bookSource(folder, docs)?.chapters.map((c) => c.title)).toEqual(["Satu"]);
  });

  it("is nothing for a plain folder or a book without text", () => {
    expect(bookSource({ ...folder, kind: undefined }, chapters)).toBeNull();
    expect(bookSource(folder, [chapter("c1", "Kosong", 0)])).toBeNull();
    expect(bookSources([folder, { ...folder, id: "x", kind: undefined }], chapters)).toHaveLength(
      1,
    );
  });

  it("names a book so that it never looks like a document id", () => {
    expect(isBookDocId(bookDocId("b"))).toBe(true);
    expect(folderIdOfBook(bookDocId("b"))).toBe("b");
    expect(isBookDocId("d1")).toBe(false);
  });
});

describe("readSubmitSource and submitDocs", () => {
  it("reads a book as it is now, and a document as itself", async () => {
    const read = reader();
    expect((await readSubmitSource(read, "book:b")).doc?.wordCount).toBe(23000);
    expect((await readSubmitSource(read, "c1")).doc?.id).toBe("c1");
    expect((await readSubmitSource(read, null)).doc).toBeNull();
    expect((await readSubmitSource(read, "book:gone")).doc).toBeNull();
  });

  it("cannot read a book from a store that only knows single documents", async () => {
    const only = { get: vi.fn(async () => null) };
    expect((await readSubmitSource(only, "book:b")).doc).toBeNull();
  });

  it("offers books only to Solo", () => {
    expect(submitDocs(solo, chapters, [folder])[0].id).toBe("book:b");
    expect(submitDocs(esai, chapters, [folder]).some((d) => d.id === "book:b")).toBe(false);
  });
});

const bookForm: SubmitForm = {
  ...emptyForm,
  docId: "book:b",
  title: "Pulang ke Pesisir",
  genre: "Novel",
  synopsis: "Sinopsis singkat.",
  agreed: true,
};

beforeEach(() => localStorage.clear());

describe("sending a whole book to Solo", () => {
  it("freezes the merged book with chapter words added and the chapter list kept", async () => {
    const store = createMemorySubmissionStore();
    const out = await sendSubmission({
      project: solo,
      registration: registration(solo.slug),
      form: bookForm,
      documents: reader(),
      store,
    });
    expect(out.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved.docId).toBe("book:b");
    expect(saved.docTitle).toBe("Pulang ke Pesisir");
    expect(saved.versions[0].wordCount).toBe(23000);
    expect(saved.versions[0].chapters).toEqual([
      { title: "Pelabuhan", words: 11000 },
      { title: "Pasar Ikan", words: 12000 },
    ]);
    expect(saved.versions[0].hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("reads the chapters again at sending, so a chapter trashed meanwhile is left out", async () => {
    const store = createMemorySubmissionStore();
    const docs = [chapters[0], { ...chapters[1], deletedAt: 5 }];
    await sendSubmission({
      project: solo,
      registration: registration(solo.slug),
      form: bookForm,
      documents: reader([...docs, chapter("c3", "Ketiga", 10000)]),
      store,
    });
    const [saved] = await store.list();
    expect(saved.versions[0].wordCount).toBe(21000);
  });

  it("applies the project's word limits to the whole book", async () => {
    const out = await sendSubmission({
      project: solo,
      registration: registration(solo.slug),
      form: bookForm,
      documents: reader([chapter("c1", "Pendek", 500)]),
      store: createMemorySubmissionStore(),
    });
    expect(out.kind).toBe("invalid");
  });

  it("sends the same book once only", async () => {
    const store = createMemorySubmissionStore();
    const input = {
      project: solo,
      registration: registration(solo.slug),
      form: bookForm,
      documents: reader(),
      store,
    };
    expect((await sendSubmission(input)).kind).toBe("sent");
    const again = await sendSubmission(input);
    expect(again.kind).toBe("invalid");
  });

  it("is refused for a project that takes work by the piece", async () => {
    const out = await sendSubmission({
      project: esai,
      registration: registration(esai.slug),
      form: { ...bookForm, genre: "Esai" },
      documents: reader(),
      store: createMemorySubmissionStore(),
    });
    expect(out.kind).toBe("invalid");
  });
});

describe("revising with a whole book", () => {
  it("keeps the chapter list on the new version", async () => {
    const store = createMemorySubmissionStore();
    const sent = await sendSubmission({
      project: solo,
      registration: registration(solo.slug),
      form: bookForm,
      documents: reader(),
      store,
    });
    if (sent.kind !== "sent") throw new Error("not sent");
    await store.update(sent.submission.id, (s) => ({
      ...s,
      status: "perlu-revisi",
      statusLog: [
        ...s.statusLog,
        { status: "perlu-revisi", at: Date.now(), by: "editor", dueAt: Date.now() + 86_400_000 },
      ],
    }));
    const current = (await store.list())[0];
    const revised = await sendRevision({
      project: solo,
      submission: current,
      docId: "book:b",
      upload: null,
      note: "",
      documents: reader([...chapters, chapter("c3", "Ketiga", 6000)]),
      store,
    });
    expect(revised.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved.versions).toHaveLength(2);
    expect(saved.versions[1].chapters).toHaveLength(3);
    expect(saved.versions[1].wordCount).toBe(29000);
  });
});
