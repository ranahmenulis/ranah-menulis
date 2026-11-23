import type { JSONContent } from "@tiptap/react";
import { chaptersOf, isBook, orderChapters } from "./book";
import { docStats } from "./editor-stats";
import type { StudioDocument, StudioFolder } from "./storage/document-store";

/** Id of a book when it is offered as one work: `book:<folder id>`. A document id never looks so. */
const BOOK_PREFIX = "book:";
export const bookDocId = (folderId: string): string => `${BOOK_PREFIX}${folderId}`;
export const isBookDocId = (id: string): boolean => id.startsWith(BOOK_PREFIX);
export const folderIdOfBook = (id: string): string => id.slice(BOOK_PREFIX.length);

/** One chapter as it went into the manuscript. */
export type BookChapter = { title: string; words: number };

/** The whole book as a single work: a document-shaped copy plus what it is made of. */
export type BookSource = { doc: StudioDocument; chapters: BookChapter[] };

/**
 * A book as one manuscript to send (STD-09, Solo): its chapters with text, in reading order, each
 * under its title as a level 1 heading. Words are the chapters' words added together, so the
 * titles do not inflate the count. Chapters that are empty, in Archive or in Sampah stay out.
 * Null when the folder is not a book or nothing in it has been written yet.
 */
export function bookSource(folder: StudioFolder, docs: StudioDocument[]): BookSource | null {
  if (!isBook(folder)) return null;
  const parts = orderChapters(chaptersOf(docs, folder.id), folder.chapterOrder)
    .map((doc) => ({ doc, words: docStats(doc.content).words }))
    .filter(({ words }) => words > 0);
  if (parts.length === 0) return null;

  const content: JSONContent[] = parts.flatMap(({ doc }) => [
    {
      type: "heading",
      attrs: { level: 1 },
      content: doc.title.trim() ? [{ type: "text", text: doc.title.trim() }] : undefined,
    },
    ...(doc.content.content ?? []),
  ]);
  const chapters = parts.map(({ doc, words }) => ({ title: doc.title.trim(), words }));
  return {
    chapters,
    doc: {
      id: bookDocId(folder.id),
      title: folder.name,
      content: { type: "doc", content },
      wordCount: chapters.reduce((sum, c) => sum + c.words, 0),
      version: 0,
      updatedAt: Math.max(...parts.map(({ doc }) => doc.updatedAt)),
    },
  };
}

/** How many chapters a book manuscript has: its level 1 headings (chapters never use level 1). */
export const bookChapterCount = (doc: Pick<StudioDocument, "content">): number =>
  (doc.content.content ?? []).filter((n) => n.type === "heading" && n.attrs?.level === 1).length;

/** Every book that can be sent now, for the picker of a project that takes whole books. */
export function bookSources(folders: StudioFolder[], docs: StudioDocument[]): BookSource[] {
  return folders.flatMap((folder) => bookSource(folder, docs) ?? []);
}
