"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { ME_ID } from "../identity";
import { judgingLogRemoteSync, juryScoresRemoteSync } from "../storage/remote-kelola-lists";

/** The signed-in dummy account, as a Judge. Real accounts replace it. */
export const JUDGE_ID = ME_ID;

/** One Judge's scores for one work: a whole number per criterion, and an optional note. */
export type JuryScore = {
  submissionId: string;
  slug: string;
  judgeId: string;
  scores: Record<string, number>;
  note: string;
  at: number;
};

const isScore = (value: unknown): value is JuryScore => {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  const scores = s.scores as Record<string, unknown> | null;
  return (
    typeof s.submissionId === "string" &&
    typeof s.slug === "string" &&
    typeof s.judgeId === "string" &&
    typeof s.note === "string" &&
    Number.isFinite(s.at) &&
    typeof scores === "object" &&
    scores !== null &&
    Object.values(scores).every((n) => Number.isFinite(n))
  );
};

/** localStorage `ranah.juryScores`; becomes a table with RLS (a Judge reads only their own). */
export const juryScores = createLocalListStore<JuryScore>(
  "ranah.juryScores",
  isScore,
  [],
  juryScoresRemoteSync,
);

/**
 * The history of closing a contest's judging (BR-PRJ-09): append-only, so reopening leaves a trace
 * with its note until the audit log exists (6g-6). The last entry of a contest is its state; no
 * entry means judging is open.
 */
export type JudgingEntry = {
  slug: string;
  state: "ditutup" | "dibuka";
  at: number;
  /** Why it was reopened; required for a reopening. */
  note?: string;
  /** Who reopened it; entries written before 6g-6 do not say. */
  by?: string;
};

const isEntry = (value: unknown): value is JudgingEntry => {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.slug === "string" &&
    (e.state === "ditutup" || e.state === "dibuka") &&
    Number.isFinite(e.at) &&
    (e.note === undefined || typeof e.note === "string") &&
    (e.by === undefined || typeof e.by === "string")
  );
};

export const judgingLog = createLocalListStore<JudgingEntry>(
  "ranah.judgingLog",
  isEntry,
  [],
  judgingLogRemoteSync,
);

export const useJuryScores = juryScores.use;
export const useJudgingLog = judgingLog.use;
