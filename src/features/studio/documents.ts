import type { StudioDocument, StudioFolder } from "./storage/document-store";
import { isActiveDocument, isArchivedDocument } from "./document-archive";
import {
  hasDocumentFilters,
  matchesDocumentFilters,
  tagKey,
  type DocumentFilters,
} from "./document-classification";

export type ListEntry =
  | { kind: "folder"; folder: StudioFolder; count: number; changedAt: number }
  | { kind: "document"; doc: StudioDocument };

const byName = (a: StudioFolder, b: StudioFolder) => a.name.localeCompare(b.name, "id");
export const NO_DOCUMENT_FILTERS: DocumentFilters = { kind: null, tag: null };

/**
 * What the Dokumen tab lists: at the top level, folders then loose documents; inside a folder, its
 * documents. Newest change first. Archive and Sampah have their own lists.
 */
export function listEntries(
  docs: StudioDocument[],
  folders: StudioFolder[],
  folderId: string | null,
  filters = NO_DOCUMENT_FILTERS,
): ListEntry[] {
  const live = docs.filter(isActiveDocument);
  const filtering = hasDocumentFilters(filters);
  const items: ListEntry[] = live
    .filter((doc) => (filtering && folderId === null) || (doc.folderId ?? null) === folderId)
    .filter((doc) => matchesDocumentFilters(doc, filters))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((doc) => ({ kind: "document", doc }));
  if (folderId !== null || filtering) return items;

  const folderItems: ListEntry[] = [...folders].sort(byName).map((folder) => {
    const inside = live.filter((d) => d.folderId === folder.id);
    return {
      kind: "folder",
      folder,
      count: inside.length,
      changedAt: Math.max(folder.createdAt, ...inside.map((d) => d.updatedAt)),
    };
  });
  return [...folderItems, ...items];
}

/** All tags available in the current scope, with one display label per filter value. */
export function documentTagOptions(docs: StudioDocument[], folderId: string | null) {
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
export function pickLastDocument(docs: StudioDocument[]): StudioDocument | null {
  let last: StudioDocument | null = null;
  for (const doc of docs) {
    if (!isActiveDocument(doc)) continue;
    if (!last || doc.updatedAt > last.updatedAt) last = doc;
  }
  return last;
}

/** Documents in Archive, most recently archived first. */
export function archived(docs: StudioDocument[]): StudioDocument[] {
  return docs.filter(isArchivedDocument).sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
}

/** Documents in Sampah, most recently trashed first. */
export function trashed(docs: StudioDocument[]): StudioDocument[] {
  return docs.filter((d) => d.deletedAt).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}
