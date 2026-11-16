import type { StudioDocument, StudioFolder } from "./storage/document-store";

export type ListEntry =
  | { kind: "folder"; folder: StudioFolder; count: number; changedAt: number }
  | { kind: "document"; doc: StudioDocument };

const byName = (a: StudioFolder, b: StudioFolder) => a.name.localeCompare(b.name, "id");

/**
 * What the Dokumen tab lists: at the top level, folders then loose documents; inside a folder, its
 * documents. Newest change first. Documents in Sampah never appear here (STD-03).
 */
export function listEntries(
  docs: StudioDocument[],
  folders: StudioFolder[],
  folderId: string | null,
): ListEntry[] {
  const live = docs.filter((d) => !d.deletedAt);
  const inFolder = live.filter((d) => (d.folderId ?? null) === folderId);
  const items: ListEntry[] = inFolder
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((doc) => ({ kind: "document", doc }));
  if (folderId !== null) return items;

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

/**
 * The document to resume writing in: the most recently edited one that is not in Sampah. Shared by
 * Beranda and the app frame so "last" means one thing. Ties keep the stored order.
 */
export function pickLastDocument(docs: StudioDocument[]): StudioDocument | null {
  let last: StudioDocument | null = null;
  for (const doc of docs) {
    if (doc.deletedAt) continue;
    if (!last || doc.updatedAt > last.updatedAt) last = doc;
  }
  return last;
}

/** Documents in Sampah, most recently trashed first. */
export function trashed(docs: StudioDocument[]): StudioDocument[] {
  return docs.filter((d) => d.deletedAt).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}
