"use client";

import { useEffect, useState } from "react";
import { pickLastDocument } from "../documents";
import type { DocumentStore, DocumentSummary } from "../storage/document-store";
import { onDocumentListChanged } from "../storage/document-events";

/**
 * The document the writer would resume, or null while loading, when there is none, or when the
 * store cannot be read: the app frame shows nothing in all three cases, since a shortcut that
 * leads nowhere is worse than none. Reads again whenever `reloadKey` changes (the route), so the
 * title is not stale after coming back from the editor. Becomes server data with the backend.
 */
export function useLastDocument(
  store: Pick<DocumentStore, "listSummaries">,
  reloadKey: string,
): DocumentSummary | null {
  const [doc, setDoc] = useState<DocumentSummary | null>(null);

  useEffect(() => {
    let request: AbortController | undefined;
    function read() {
      request?.abort();
      request = new AbortController();
      const { signal } = request;
      store
        .listSummaries(signal)
        .then((docs) => !signal.aborted && setDoc(pickLastDocument(docs)))
        .catch(() => !signal.aborted && setDoc(null));
    }
    const unsubscribe = onDocumentListChanged(read);
    read();
    return () => {
      request?.abort();
      unsubscribe();
    };
  }, [store, reloadKey]);

  return doc;
}
