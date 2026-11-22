import type { JSONContent } from "@tiptap/react";
import { sanitizeLayout, type DocumentLayout } from "../document-layout";
import type { DocumentTarget } from "../document-targets";

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
