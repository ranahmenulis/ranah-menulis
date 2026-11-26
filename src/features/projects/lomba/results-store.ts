"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { contestResultsRemoteSync } from "../storage/remote/remote-project-lists";
import { contestResults } from "./fixtures";
import type { ContestResults } from "./types";

const isEntry = (v: unknown) =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as { id?: unknown }).id === "string" &&
  typeof (v as { title?: unknown }).title === "string" &&
  typeof (v as { genre?: unknown }).genre === "string" &&
  typeof (v as { authorId?: unknown }).authorId === "string";

const isWinner = (v: unknown) =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as { entryId?: unknown }).entryId === "string" &&
  Number.isInteger((v as { rank?: unknown }).rank) &&
  typeof (v as { jurorNote?: unknown }).jurorNote === "string";

const isResults = (value: unknown): value is ContestResults => {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.slug === "string" &&
    Array.isArray(r.finalists) &&
    r.finalists.every(isEntry) &&
    Array.isArray(r.winners) &&
    r.winners.every(isWinner)
  );
};

/** The results an Organizer set (LMB-02), on this device. They win over the sample results. */
export const storedResults = createLocalListStore<ContestResults>(
  "ranah.contestResults",
  isResults,
  [],
  contestResultsRemoteSync,
);

/** Sample results with the Organizer's on top: a contest with its own record uses only that. */
export const mergeResults = (
  stored: readonly ContestResults[],
  samples: ContestResults[] = contestResults,
): ContestResults[] =>
  stored.length === 0
    ? samples
    : [...samples.filter((s) => !stored.some((r) => r.slug === s.slug)), ...stored];
