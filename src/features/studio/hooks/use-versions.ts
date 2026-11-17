"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentStore } from "../storage/document-store";
import type { DocumentVersion } from "../versions";

export type VersionsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; versions: DocumentVersion[]; loadedAt: number };

type Result = { key: string; value: { versions: DocumentVersion[]; loadedAt: number } | "error" };

/**
 * Versions of a document, loaded each time the panel opens (so a version made a moment ago shows).
 * A draft that is not stored yet has none. "Loading" is derived: a result only counts when it was
 * loaded for the current opening, so nothing has to be reset inside an effect.
 */
export function useVersions(store: DocumentStore, docId: string, open: boolean) {
  const [attempt, setAttempt] = useState(0);
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((n) => n + 1);
  }
  const key = `${session}:${attempt}:${docId}`;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = docId ? store.listVersions(docId) : Promise.resolve([]);
    load
      .then((versions) => {
        // Read here, in the effect: the render must not read the clock.
        if (!cancelled) setResult({ key, value: { versions, loadedAt: Date.now() } });
      })
      .catch(() => !cancelled && setResult({ key, value: "error" }));
    return () => {
      cancelled = true;
    };
  }, [store, docId, open, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  let state: VersionsState = { status: "loading" };
  if (result?.key === key) {
    state = result.value === "error" ? { status: "error" } : { status: "ready", ...result.value };
  }
  return { state, reload };
}
