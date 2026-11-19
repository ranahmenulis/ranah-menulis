"use client";

import { useEffect, useState } from "react";
import { pickLastDocument } from "../documents";
import type { DocumentStore, StudioDocument } from "../storage/document-store";
import { onDocumentListChanged } from "../storage/document-events";

/**
 * The document the writer would resume, or null while loading, when there is none, or when the
 * store cannot be read: the app frame shows nothing in all three cases, since a shortcut that
 * leads nowhere is worse than none. Reads again whenever `reloadKey` changes (the route), so the
 * title is not stale after coming back from the editor. Becomes server data with the backend.
 */
export function useLastDocument(store: DocumentStore, reloadKey: string): StudioDocument | null {
  const [doc, setDoc] = useState<StudioDocument | null>(null);

  useEffect(() => {
    let cancelled = false;
    let latest = 0;
    function read() {
      const request = ++latest;
      store
        .list()
        .then((docs) => !cancelled && request === latest && setDoc(pickLastDocument(docs)))
        .catch(() => !cancelled && request === latest && setDoc(null));
    }
    const unsubscribe = onDocumentListChanged(read);
    read();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [store, reloadKey]);

  return doc;
}
