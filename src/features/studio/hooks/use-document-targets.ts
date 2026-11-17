"use client";

import { useMemo } from "react";
import { targetSummary, type DocumentTarget } from "../document-targets";
import { useToday } from "./use-today";

/** Today and the one-line summary of the nearest open target, for the counter popover. */
export function useDocumentTargets(targets: DocumentTarget[], words: number) {
  const today = useToday();
  const summary = useMemo(
    () => (today === "" ? null : targetSummary(targets, words, today)),
    [targets, words, today],
  );
  return { today, summary };
}
