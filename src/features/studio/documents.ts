import type { DocumentSummary, StudioFolder } from "./storage/document-store";
import { isBook, orderChapters } from "./book";
import { isActiveDocument, isArchivedDocument } from "./document-archive";
import {
  hasDocumentFilters,
  matchesDocumentFilters,
  tagKey,
  type DocumentFilters,
} from "./document-classification";

export type ListEntry<T extends DocumentSummary> =
  | { kind: "folder"; folder: StudioFolder; count: number; words: number; changedAt: number }
  | { kind: "document"; doc: T };

const byName = (a: StudioFolder, b: StudioFolder) => a.name.localeCompare(b.name, "id");
export const NO_DOCUMENT_FILTERS: DocumentFilters = { kind: null, tag: null };

/**
 * What the Dokumen tab lists: at the top level, folders then loose documents; inside a folder, its
 * documents. Newest change first. Archive and Sampah have their own lists.
 */
export function listEntries<T extends DocumentSummary>(
  docs: T[],
  folders: StudioFolder[],
  folderId: string | null,
  filters = NO_DOCUMENT_FILTERS,
  searchMatches: ReadonlySet<string> | null = null,
): ListEntry<T>[] {
  const filtering = hasDocumentFilters(filters) || searchMatches !== null;
  const scoped = documentsInScope(docs, folderId, filters, filtering)
    .filter(({ id }) => searchMatches === null || searchMatches.has(id))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const openFolder = folders.find((f) => f.id === folderId);
  // A book lists its chapters in reading order; a search or filter keeps the usual order.
  const chapters =
    openFolder && isBook(openFolder) && !filtering
      ? orderChapters(scoped, openFolder.chapterOrder)
      : scoped;
  const items: ListEntry<T>[] = chapters.map((doc) => ({ kind: "document", doc }));
  if (folderId !== null || filtering) return items;

  const live = docs.filter(isActiveDocument);
  const folderItems: ListEntry<T>[] = [...folders].sort(byName).map((folder) => {
    const inside = live.filter((doc) => doc.folderId === folder.id);
    return {
      kind: "folder",
      folder,
      count: inside.length,
      words: inside.reduce((sum, doc) => sum + doc.wordCount, 0),
      changedAt: Math.max(folder.createdAt, ...inside.map((d) => d.updatedAt)),
    };
  });
  return [...folderItems, ...items];
}

export function documentsInScope<T extends DocumentSummary>(
  docs: T[],
  folderId: string | null,
  filters: DocumentFilters,
  acrossFolders: boolean,
): T[] {
  return docs.filter(
    (doc) =>
      isActiveDocument(doc) &&
      ((acrossFolders && folderId === null) || (doc.folderId ?? null) === folderId) &&
      matchesDocumentFilters(doc, filters),
  );
}

/** All tags available in the current scope, with one display label per filter value. */
export function documentTagOptions(docs: DocumentSummary[], folderId: string | null) {
  const labels = new Map<string, string>();
  for (const doc of docs) {
    if (!isActiveDocument(doc) || (folderId !== null && doc.folderId !== folderId)) continue;
    for (const tag of doc.tags ?? []) {
      const key = tagKey(tag);
      if (!labels.has(key)) labels.set(key, tag);
    }
  }
  return [...labels].sort(([, a], [, b]) => a.localeCompare(b, "id"));
}

/**
 * The document to resume writing in: the most recently edited active document. Shared by
 * Beranda and the app frame so "last" means one thing. Ties keep the stored order.
 */
export function pickLastDocument<T extends DocumentSummary>(docs: T[]): T | null {
  let last: T | null = null;
  for (const doc of docs) {
    if (!isActiveDocument(doc)) continue;
    if (!last || doc.updatedAt > last.updatedAt) last = doc;
  }
  return last;
}

/** Documents in Archive, most recently archived first. */
export function archived<T extends DocumentSummary>(docs: T[]): T[] {
  return docs.filter(isArchivedDocument).sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
}

/** Documents in Sampah, most recently trashed first. */
export function trashed<T extends DocumentSummary>(docs: T[]): T[] {
  return docs.filter((d) => d.deletedAt).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}
