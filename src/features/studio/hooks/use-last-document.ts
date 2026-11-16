"use client";

import { useEffect, useState } from "react";
import { pickLastDocument } from "../documents";
import type { DocumentStore, StudioDocument } from "../storage/document-store";

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
    store
      .list()
      .then((docs) => !cancelled && setDoc(pickLastDocument(docs)))
      .catch(() => !cancelled && setDoc(null));
    return () => {
      cancelled = true;
    };
  }, [store, reloadKey]);

  return doc;
}
