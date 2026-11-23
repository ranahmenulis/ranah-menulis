import type { JSONContent } from "@tiptap/react";
import { sanitizeLayout, type DocumentLayout } from "../document-layout";
import { sanitizeTargets, type DocumentTarget } from "../document-targets";
import type { DocumentStore, SaveInput, StudioDocument } from "../storage/document-store";

export const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/** What the editor holds right now and would write on the next save. */
export type LatestDocument = {
  title: string;
  content: JSONContent;
  words: number;
  targets: DocumentTarget[];
  /** Stays undefined until the writer changes it (or the stored document already has one). */
  layout?: DocumentLayout;
};

export function isBlankDraft(version: number, title: string, words: number): boolean {
  return version === 0 && title.trim() === "" && words === 0;
}

/** A stored layout is repaired field by field; a document that never had one keeps none. */
export function storedLayout(layout: unknown): DocumentLayout | undefined {
  return layout ? sanitizeLayout(layout) : undefined;
}

/** What the editor holds right after opening a stored document. */
export function latestOf(doc: StudioDocument): LatestDocument {
  return {
    title: doc.title,
    content: doc.content,
    words: doc.wordCount,
    targets: sanitizeTargets(doc.targets),
    layout: storedLayout(doc.layout),
  };
}

/** What one save writes. The folder only travels with the first save of a new document. */
export function saveInputOf(
  id: string,
  latest: LatestDocument,
  firstSave: boolean,
  folderId: string | null,
): SaveInput {
  const { title, content, words, targets, layout } = latest;
  return {
    id,
    title,
    content,
    wordCount: words,
    targets,
    ...(layout ? { layout } : {}),
    ...(firstSave && folderId ? { folderId } : {}),
  };
}

/** The folder a new document is filed in, or null when it is gone (or none was asked for). */
export async function existingFolderId(
  store: DocumentStore,
  folderId: string | undefined,
): Promise<string | null> {
  if (!folderId) return null;
  const folders = await store.listFolders();
  return folders.some((f) => f.id === folderId) ? folderId : null;
}
