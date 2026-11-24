import type { JSONContent } from "@tiptap/react";
import { chaptersOf, coverOf, isBook, orderChapters } from "./book";
import { sanitizeTargets, type DocumentTarget } from "./document-targets";
import { isActiveDocument } from "./document-archive";
import { tagKey, type DocumentFilters, type DocumentKind } from "./document-classification";
import type { DocumentSummary, FolderCover, StudioFolder } from "./storage/document-store";

/**
 * A work (UI: "Naskah"): the unit the Studio table lists. A loose document is a work of one
 * chapter; a book (a folder with `kind: "book"`) is a work of many. Plain folders are not works:
 * they group works, like a shelf.
 */
export type Work = {
  /** Document id for a loose document, folder id for a book. */
  id: string;
  type: "document" | "book";
  title: string;
  words: number;
  genre: DocumentKind | null;
  tags: string[];
  synopsis: string;
  /** Last change to the work or any of its chapters. */
  updatedAt: number;
  createdAt: number;
  chapters: number;
  /** The plain folder the work is filed in, or null at the top level. */
  collectionId: string | null;
  cover: FolderCover | null;
  /** Document to open for writing: the loose document, or the first chapter of a book (if any). */
  openId: string | null;
  /** Ids of the documents that make up the work, in reading order; search matches on these. */
  chapterIds: string[];
  /** Word targets of the work: the document's own, or the book's (counted on all chapters). */
  targets: DocumentTarget[];
};

/** A stored cover, or null when absent or not well formed (data may be edited by hand). */
function validCover(raw: unknown): FolderCover | null {
  const cover = raw as Partial<FolderCover> | undefined;
  return cover &&
    typeof cover.fileId === "string" &&
    cover.fileId !== "" &&
    typeof cover.alt === "string"
    ? { fileId: cover.fileId, alt: cover.alt }
    : null;
}

/** The first words of a document, for a preview card: plain text, one line, cut at a word. */
export function snippetOf(content: JSONContent | undefined, max = 140): string {
  const parts: string[] = [];
  const walk = (node: JSONContent | undefined) => {
    if (!node || parts.join(" ").length > max) return;
    if (typeof node.text === "string") parts.push(node.text);
    node.content?.forEach(walk);
  };
  walk(content);
  const text = parts.join(" ").replace(/\s+/gu, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).trimEnd()}…`;
}

/** The work's own page: summary and chapters. */
export const workHref = (work: Pick<Work, "id">, tab: "ringkasan" | "isi" = "ringkasan") =>
  tab === "isi" ? `/studio/naskah/${work.id}/isi` : `/studio/naskah/${work.id}`;

/** The editor of one chapter; `from` makes its back arrow return to that work's chapters. */
export const chapterHref = (docId: string, from?: string) =>
  from ? `/studio/${docId}?dari=${encodeURIComponent(from)}` : `/studio/${docId}`;

/**
 * Finds the work an id points to: a loose document or a book directly, or the book a chapter
 * belongs to (so a chapter's address, or a document that just became a chapter, still lands on
 * its work). `null` when nothing active matches.
 */
export function findWork(works: Work[], id: string): { work: Work; redirect: boolean } | null {
  const direct = works.find((work) => work.id === id);
  if (direct) return { work: direct, redirect: false };
  const parent = works.find((work) => work.chapterIds.includes(id));
  return parent ? { work: parent, redirect: true } : null;
}

export type WorkSortKey = "title" | "words" | "genre" | "updated" | "created";
export type WorkSort = { key: WorkSortKey; dir: "asc" | "desc" };
export const DEFAULT_WORK_SORT: WorkSort = { key: "updated", dir: "desc" };

const isPlainFolder = (folder: StudioFolder) => !isBook(folder);

/** Plain folders: they hold works but are not works themselves. */
export const collectionsOf = (folders: StudioFolder[]) => folders.filter(isPlainFolder);

function documentWork(doc: DocumentSummary, collections: Set<string>): Work {
  return {
    id: doc.id,
    type: "document",
    title: doc.title,
    words: doc.wordCount,
    genre: doc.kind ?? null,
    tags: doc.tags ?? [],
    synopsis: doc.synopsis ?? "",
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt ?? doc.updatedAt,
    chapters: 1,
    // A document filed in a book is a chapter, not a work; the caller never passes those.
    collectionId: doc.folderId && collections.has(doc.folderId) ? doc.folderId : null,
    cover: validCover(doc.cover),
    openId: doc.id,
    chapterIds: [doc.id],
    targets: sanitizeTargets(doc.targets),
  };
}

function bookWork(book: StudioFolder, docs: DocumentSummary[], collections: Set<string>): Work {
  const chapters = orderChapters(chaptersOf(docs, book.id), book.chapterOrder);
  const touched = [book.createdAt, ...chapters.map((doc) => doc.updatedAt)];
  return {
    id: book.id,
    type: "book",
    title: book.name,
    words: chapters.reduce((sum, doc) => sum + doc.wordCount, 0),
    genre: book.genre ?? null,
    tags: Array.isArray(book.tags) ? book.tags : [],
    synopsis: typeof book.synopsis === "string" ? book.synopsis : "",
    updatedAt: Math.max(...touched),
    createdAt: book.createdAt,
    chapters: chapters.length,
    collectionId:
      book.collectionId && collections.has(book.collectionId) ? book.collectionId : null,
    cover: coverOf(book),
    openId: chapters[0]?.id ?? null,
    chapterIds: chapters.map((doc) => doc.id),
    targets: sanitizeTargets(book.targets),
  };
}

/** Every active work: loose documents (not filed in a book) and books, in no particular order. */
export function buildWorks(docs: DocumentSummary[], folders: StudioFolder[]): Work[] {
  const books = new Set(folders.filter(isBook).map((folder) => folder.id));
  const collections = new Set(collectionsOf(folders).map((folder) => folder.id));
  const loose = docs.filter(
    (doc) => isActiveDocument(doc) && !(doc.folderId && books.has(doc.folderId)),
  );
  return [
    ...loose.map((doc) => documentWork(doc, collections)),
    ...folders.filter(isBook).map((book) => bookWork(book, docs, collections)),
  ];
}

const textOrder = (a: string, b: string) => a.localeCompare(b, "id", { sensitivity: "base" });

const COMPARE: Record<WorkSortKey, (a: Work, b: Work) => number> = {
  title: (a, b) => textOrder(a.title, b.title),
  words: (a, b) => a.words - b.words,
  // Works without a type go last in either direction, so the sort never hides the typed ones.
  genre: (a, b) => textOrder(a.genre ?? "", b.genre ?? ""),
  updated: (a, b) => a.updatedAt - b.updatedAt,
  created: (a, b) => a.createdAt - b.createdAt,
};

export function sortWorks(works: Work[], { key, dir }: WorkSort = DEFAULT_WORK_SORT): Work[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...works].sort((a, b) => {
    if (key === "genre" && (a.genre === null) !== (b.genre === null))
      return a.genre === null ? 1 : -1;
    return sign * COMPARE[key](a, b) || a.id.localeCompare(b.id);
  });
}

/**
 * The documents a list search reads: everything active at the top level, and inside a collection
 * its loose documents plus the chapters of the books filed there.
 */
export function searchCandidates(
  docs: DocumentSummary[],
  folders: StudioFolder[],
  collectionId: string | null,
): DocumentSummary[] {
  const active = docs.filter(isActiveDocument);
  if (collectionId === null) return active;
  const scope = new Set([
    collectionId,
    ...folders
      .filter((folder) => isBook(folder) && folder.collectionId === collectionId)
      .map((folder) => folder.id),
  ]);
  return active.filter((doc) => doc.folderId && scope.has(doc.folderId));
}

/**
 * Work ids a search matches: a work matches when one of its documents matched the text, or (for
 * a book) when its own title contains the query. Null while there is no search.
 */
export function workMatches(
  works: Work[],
  documentMatches: ReadonlySet<string> | null,
  query: string,
): Set<string> | null {
  if (documentMatches === null) return null;
  const term = query.normalize("NFC").toLowerCase().trim().replace(/\s+/gu, " ");
  return new Set(
    works
      .filter(
        (work) =>
          work.chapterIds.some((id) => documentMatches.has(id)) ||
          (work.type === "book" && term !== "" && work.title.toLowerCase().includes(term)),
      )
      .map((work) => work.id),
  );
}

/** Next sort after clicking a column: the same column flips, a new one starts in its natural order. */
export function nextSort(current: WorkSort, key: WorkSortKey): WorkSort {
  if (current.key === key) return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  return { key, dir: key === "updated" || key === "created" || key === "words" ? "desc" : "asc" };
}

/**
 * What the table shows: works of one scope (a collection, or the top level), narrowed by the type
 * and tag filters and by search matches (work ids). At the top level a filter or a search looks
 * across every collection; inside a collection it stays in that collection.
 */
export function listWorks(
  works: Work[],
  collectionId: string | null,
  filters: DocumentFilters,
  searchMatches: ReadonlySet<string> | null,
  sort: WorkSort = DEFAULT_WORK_SORT,
): Work[] {
  const everywhere =
    collectionId === null && (Boolean(filters.kind || filters.tag) || searchMatches !== null);
  return sortWorks(
    works.filter(
      (work) =>
        (everywhere || work.collectionId === collectionId) &&
        (!filters.kind || work.genre === filters.kind) &&
        (!filters.tag || work.tags.some((tag) => tagKey(tag) === filters.tag)) &&
        (searchMatches === null || searchMatches.has(work.id)),
    ),
    sort,
  );
}
