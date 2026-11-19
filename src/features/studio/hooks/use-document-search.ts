"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useViewer } from "@/lib/viewer";
import { scanDocumentMatches, searchText } from "../document-search";
import type { DocumentFilters } from "../document-classification";
import { documentsInScope } from "../documents";
import type { DocumentStore, DocumentSummary } from "../storage/document-store";
import { studioStore } from "../storage/store";

const SEARCH_DELAY_MS = 250;
type Result = { status: "ready"; ids: ReadonlySet<string> } | { status: "error" };

export function useDocumentListSearch(
  docs: DocumentSummary[],
  folderId: string | null,
  filters: DocumentFilters,
  activeReady: boolean,
) {
  const viewer = useViewer();
  const [keyword, setKeyword] = useState<{ folderId: string | null; text: string }>({
    folderId: null,
    text: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const query = keyword.folderId === folderId ? keyword.text : "";
  const enabled = activeReady && viewer === "masuk";
  const candidates = useMemo(
    () => documentsInScope(docs, folderId, filters, true),
    [docs, folderId, filters],
  );
  const state = useDocumentSearch(studioStore, candidates, enabled ? query : "");
  const matches = state.status === "ready" ? state.ids : null;

  function setQuery(text: string) {
    setKeyword({ folderId, text });
  }

  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return { state, enabled, matches, query, setQuery, inputRef, clear };
}

export function useDocumentSearch(
  store: Pick<DocumentStore, "get">,
  candidates: readonly DocumentSummary[],
  query: string,
) {
  const term = searchText(query);
  const [attempt, setAttempt] = useState(0);
  const [finished, setFinished] = useState<{
    candidates: readonly DocumentSummary[];
    term: string;
    attempt: number;
    result: Result;
  }>();

  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const { signal } = controller;
    function finish(result: Result) {
      if (!signal.aborted) setFinished({ candidates, term, attempt, result });
    }
    const timer = window.setTimeout(() => {
      void scanDocumentMatches(store, candidates, term, signal).then(
        (ids) => finish({ status: "ready", ids }),
        () => finish({ status: "error" }),
      );
    }, SEARCH_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [store, candidates, term, attempt]);

  if (!term) return { status: "idle" } as const;
  if (
    finished?.term !== term ||
    finished.attempt !== attempt ||
    finished.candidates !== candidates
  ) {
    return { status: "loading" } as const;
  }
  return { ...finished.result, retry: () => setAttempt((value) => value + 1) };
}
