"use client";

import { useEffect, useState, type Dispatch } from "react";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { isArchivedDocument } from "@/features/studio/document-archive";
import type { ComposeAction } from "../compose-state";
import { blocksFromDocument } from "../doc-blocks";

/**
 * What became of the document named in the address (`/tulis?dokumen=`): still loading, chosen as the
 * source, or why it could not be selected.
 */
export type SourceParam = "none" | "loading" | "ready" | "gone" | "archived" | "empty" | "error";

/**
 * Opens "Tulis postingan" with a Studio document already chosen (STD-10). Only the document is
 * chosen: the author still ticks the parts to share, and nothing is public until they publish.
 */
export function useSourceParam(
  store: DocumentStore,
  documentId: string | null,
  dispatch: Dispatch<ComposeAction>,
): SourceParam {
  const [state, setState] = useState<SourceParam>(documentId ? "loading" : "none");

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;
    store
      .get(documentId)
      .then((doc) => {
        if (cancelled) return;
        if (!doc || doc.deletedAt) return setState("gone");
        if (isArchivedDocument(doc)) return setState("archived");
        const blocks = blocksFromDocument(doc.content);
        if (blocks.length === 0) return setState("empty");
        dispatch({
          type: "pick",
          pick: { docId: doc.id, docTitle: doc.title.trim() || "Tanpa judul", blocks, chosen: [] },
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [store, documentId, dispatch]);

  return state;
}
