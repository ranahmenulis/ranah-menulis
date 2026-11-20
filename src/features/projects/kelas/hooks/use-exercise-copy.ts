"use client";

import { useEffect, useState } from "react";
import { isActiveDocument } from "@/features/studio/document-archive";
import { onDocumentListChanged } from "@/features/studio/storage/document-events";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { classCopies, copyKey } from "../copy-store";

/**
 * Whether this exercise already has a copy in the writing list (KLS-06). A copy that was moved to
 * Sampah or Archive no longer counts, so the button goes back to "Salin". The answer is checked in
 * the store and rechecked when the document list changes; the real check happens again on press.
 */
export function useExerciseCopy(
  slug: string,
  materialId: string,
  store: Pick<DocumentStore, "get">,
) {
  const docId = classCopies.use().find((c) => c.key === copyKey(slug, materialId))?.docId;
  const [checked, setChecked] = useState<{ docId: string; active: boolean } | null>(null);

  useEffect(() => {
    if (!docId) return;
    let cancelled = false;
    const check = () =>
      store.get(docId).then(
        (doc) => {
          if (!cancelled) setChecked({ docId, active: !!doc && isActiveDocument(doc) });
        },
        () => {},
      );
    void check();
    const stop = onDocumentListChanged(() => void check());
    return () => {
      cancelled = true;
      stop();
    };
  }, [docId, store]);

  return docId !== undefined && checked?.docId === docId && checked.active;
}
