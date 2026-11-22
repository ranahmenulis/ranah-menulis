import type { StudioDocument } from "./storage/document-store";

export const ARCHIVE_HREF = "/studio?tab=arsip";
export const RESTORE_ARCHIVED_MESSAGE = "Dokumen ini ada di Arsip. Pulihkan dulu untuk memakainya.";

const RESTORE_ARCHIVED_EN = "This document is in the Archive. Restore it first to use it.";

/** The same sentence in the interface language, for screens that already know it. */
export function restoreArchivedMessage(locale: "id" | "en"): string {
  return locale === "en" ? RESTORE_ARCHIVED_EN : RESTORE_ARCHIVED_MESSAGE;
}

type DocumentLocation = Pick<StudioDocument, "archivedAt" | "deletedAt">;

export function isArchivedDocument(doc: DocumentLocation) {
  return doc.deletedAt == null && doc.archivedAt != null;
}

export function isActiveDocument(doc: DocumentLocation) {
  return doc.deletedAt == null && doc.archivedAt == null;
}

/** Moving to or from archive preserves the editor's base version and last writing time. */
export function changeDocumentArchive(
  doc: StudioDocument | undefined,
  archived: boolean,
  now: number,
  folderExists: boolean,
): StudioDocument | null {
  if (!doc || doc.deletedAt != null || isArchivedDocument(doc) === archived) return null;
  if (archived) return { ...doc, archivedAt: now };
  return { ...doc, archivedAt: null, folderId: folderExists ? doc.folderId : null };
}

/** Explicitly copy writing and classification. Relationships and writing logs belong to the source. */
export function copyActiveDocument(
  source: StudioDocument | undefined,
  id: string,
  now: number,
): StudioDocument | null {
  if (!source || !isActiveDocument(source)) return null;
  const { content, wordCount, folderId, kind, tags, layout } = source;
  return {
    id,
    title: `${source.title.trim() || "Tanpa judul"} (salinan)`,
    content,
    wordCount,
    folderId,
    kind,
    tags,
    layout,
    version: 1,
    updatedAt: now,
  };
}
