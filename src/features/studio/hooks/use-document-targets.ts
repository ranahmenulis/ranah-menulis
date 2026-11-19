"use client";

import { useMemo } from "react";
import { nearestTarget, targetLine, targetStatus, type DocumentTarget } from "../document-targets";
import { useToday } from "./use-today";

/** Today and the counter data for the nearest target that has not been reached. */
export function useDocumentTargets(targets: DocumentTarget[], words: number) {
  const today = useToday();
  const counter = useMemo(() => {
    if (today === "") return undefined;
    const target = nearestTarget(targets, words, today);
    if (!target) return null;
    return {
      words: target.words,
      missed: targetStatus(target, words, today) === "terlewat",
      summary: targetLine(target, words, today),
    };
  }, [targets, words, today]);
  return { today, counter };
}
