import { isActiveDocument } from "./document-archive";
import type { DocumentSummary, FolderCover, StudioFolder } from "./storage/document-store";

/** Longest book title; a folder name has no limit of its own. */
export const BOOK_TITLE_LIMIT = 120;
/** A cover's description, kept short like the poster's. */
export const COVER_ALT_LIMIT = 200;

export const isBook = (folder: StudioFolder): boolean => folder.kind === "book";

/** The cover of a book, or null when it has none or the stored value is not well formed. */
export function coverOf(folder: StudioFolder): FolderCover | null {
  const cover = folder.cover as Partial<FolderCover> | undefined;
  if (!isBook(folder) || !cover) return null;
  return typeof cover.fileId === "string" && cover.fileId !== "" && typeof cover.alt === "string"
    ? { fileId: cover.fileId, alt: cover.alt }
    : null;
}

/** The saved chapter order; anything that is not a list of text is ignored. */
function savedOrder(order: unknown): string[] {
  return Array.isArray(order) ? order.filter((id): id is string => typeof id === "string") : [];
}

/** The active documents filed in this book. */
export const chaptersOf = <T extends DocumentSummary>(docs: T[], folderId: string): T[] =>
  docs.filter((doc) => isActiveDocument(doc) && doc.folderId === folderId);

/**
 * Chapters in reading order: the saved order first, then chapters that are not in it (new ones) by
 * the time they were first stored, so a new chapter lands at the end and editing never moves it.
 */
export function orderChapters<T extends DocumentSummary>(chapters: T[], order: unknown): T[] {
  const byId = new Map(chapters.map((doc) => [doc.id, doc]));
  const listed = [...new Set(savedOrder(order))].flatMap((id) => byId.get(id) ?? []);
  const known = new Set(listed.map((doc) => doc.id));
  const rest = chapters
    .filter((doc) => !known.has(doc.id))
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0) || a.id.localeCompare(b.id));
  return [...listed, ...rest];
}

/** Ids after moving one chapter a step up (-1) or down (1); null at the edge or when unknown. */
export function moveChapter(ids: string[], id: string, step: -1 | 1): string[] | null {
  const from = ids.indexOf(id);
  const to = from + step;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** Words of the whole book: the active chapters added together. */
export const bookWords = (chapters: DocumentSummary[]): number =>
  chapters.reduce((sum, doc) => sum + doc.wordCount, 0);

export type BookProblem = "titleRequired" | "titleTooLong" | "altRequired" | "altTooLong";

/** One code per broken rule, in the order the fields appear; null when the book can be saved. */
export function validateBook(title: string, cover: FolderCover | null): BookProblem | null {
  const name = title.trim();
  if (!name) return "titleRequired";
  if (name.length > BOOK_TITLE_LIMIT) return "titleTooLong";
  if (cover && !cover.alt.trim()) return "altRequired";
  if (cover && cover.alt.trim().length > COVER_ALT_LIMIT) return "altTooLong";
  return null;
}
