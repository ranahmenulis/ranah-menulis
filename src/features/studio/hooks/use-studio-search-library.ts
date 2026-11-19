"use client";

import { useEffect, useState } from "react";
import { onDocumentListChanged } from "../storage/document-events";
import type { DocumentStore, DocumentSummary, StudioFolder } from "../storage/document-store";

type SearchLibrary =
  | { status: "loading" | "error" }
  | { status: "ready"; docs: DocumentSummary[]; folders: StudioFolder[] };

export function useStudioSearchLibrary(
  store: Pick<DocumentStore, "listSummaries" | "listFolders">,
) {
  const [library, setLibrary] = useState<SearchLibrary>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let request: AbortController | undefined;
    function read() {
      request?.abort();
      request = new AbortController();
      const { signal } = request;
      void Promise.all([store.listSummaries(signal), store.listFolders()]).then(
        ([docs, folders]) => !signal.aborted && setLibrary({ status: "ready", docs, folders }),
        () => !signal.aborted && setLibrary({ status: "error" }),
      );
    }
    const unsubscribe = onDocumentListChanged(read);
    window.addEventListener("focus", read);
    read();
    return () => {
      unsubscribe();
      window.removeEventListener("focus", read);
      request?.abort();
    };
  }, [store, attempt]);

  return {
    library,
    reload: () => {
      setLibrary({ status: "loading" });
      setAttempt((value) => value + 1);
    },
  };
}
