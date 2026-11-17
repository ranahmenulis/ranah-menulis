import { stageRank } from "@/features/projects/lomba/contest-model";
import type { ContestStage } from "@/features/projects/lomba/types";
import type { Submission } from "@/features/projects/submission-types";
import { canonicalId } from "../identity";
import type { JudgingEntry, JuryScore } from "./score-store";

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;
export const NOTE_LIMIT = 1000;

export type Criterion = { name: string; weight: number };

/** The work a Judge sees: everything sent that is not a draft and was not withdrawn. */
export const judgeableWorks = (submissions: readonly Submission[], slug: string): Submission[] =>
  submissions
    .filter((s) => s.slug === slug && s.status !== "draf" && s.status !== "ditarik")
    .sort((a, b) => a.submittedAt - b.submittedAt || a.id.localeCompare(b.id));

// ---- judging state -------------------------------------------------------------------------

export type JudgingStatus = "belum-dibuka" | "dibuka" | "ditutup";

export const isClosed = (log: readonly JudgingEntry[], slug: string): boolean =>
  log.findLast((e) => e.slug === slug)?.state === "ditutup";

/**
 * [usulan] Judging opens once the contest stops taking work (any stage after "terbuka") and ends
 * when the Organizer closes it (BR-PRJ-09), not by the announcement: an announcement is never taken
 * back, but a closed judging can be reopened by an Administrator with a note.
 */
export function judgingStatus(
  stage: ContestStage,
  log: readonly JudgingEntry[],
  slug: string,
): JudgingStatus {
  if (isClosed(log, slug)) return "ditutup";
  return stageRank(stage) >= stageRank("dinilai") ? "dibuka" : "belum-dibuka";
}

export const judgingText: Record<JudgingStatus, string> = {
  "belum-dibuka": "Penilaian dimulai setelah penerimaan karya ditutup.",
  dibuka: "Penilaian dibuka. Skormu bisa diubah sampai penilaian ditutup.",
  ditutup: "Penilaian ditutup. Skor tidak bisa diubah lagi.",
};

// ---- scores --------------------------------------------------------------------------------

export type ScoreErrors = Record<string, string>;

/** One message per criterion that fails, and one for the note; nothing typed is dropped. */
export function validateScores(
  criteria: readonly Criterion[],
  input: Record<string, string>,
  note: string,
): { errors: ScoreErrors; scores: Record<string, number> } {
  const errors: ScoreErrors = {};
  const scores: Record<string, number> = {};
  for (const { name } of criteria) {
    const text = (input[name] ?? "").trim();
    const value = /^\d{1,2}$/.test(text) ? Number(text) : NaN;
    if (!Number.isInteger(value) || value < SCORE_MIN || value > SCORE_MAX) {
      errors[name] = `Isi angka bulat ${SCORE_MIN} sampai ${SCORE_MAX}.`;
    } else scores[name] = value;
  }
  if (note.trim().length > NOTE_LIMIT) {
    errors.note = `Catatan paling banyak ${NOTE_LIMIT.toLocaleString("id-ID")} karakter.`;
  }
  return { errors, scores };
}

/**
 * [usulan, Q-28] The weighted mean of one Judge's scores by the criteria weights, 1 to 10 with two
 * decimals. A criterion with no score makes the result `null`: a half-scored work has no score.
 */
export function weightedScore(
  criteria: readonly Criterion[],
  scores: Record<string, number>,
): number | null {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (total <= 0) return null;
  let sum = 0;
  for (const c of criteria) {
    const value = scores[c.name];
    if (value === undefined) return null;
    sum += value * c.weight;
  }
  return Math.round((sum / total) * 100) / 100;
}

/** [usulan, Q-28] The mean over the Judges who scored the work; `null` when nobody has. */
export function aggregateScore(
  criteria: readonly Criterion[],
  entries: readonly JuryScore[],
): number | null {
  const each = entries.flatMap((e) => {
    const score = weightedScore(criteria, e.scores);
    return score === null ? [] : [score];
  });
  if (each.length === 0) return null;
  return Math.round((each.reduce((a, b) => a + b, 0) / each.length) * 100) / 100;
}

export const scoreText = (value: number): string => value.toLocaleString("id-ID");

// ---- the list ------------------------------------------------------------------------------

export type JudgeFilter = "belum" | "sudah" | "semua";
export const JUDGE_FILTERS: { id: JudgeFilter; label: string }[] = [
  { id: "belum", label: "Belum dinilai" },
  { id: "sudah", label: "Sudah dinilai" },
  { id: "semua", label: "Semua" },
];
export const DEFAULT_JUDGE_FILTER: JudgeFilter = "belum";

export const parseJudgeFilter = (value: string | null | undefined): JudgeFilter =>
  JUDGE_FILTERS.find((f) => f.id === value)?.id ?? DEFAULT_JUDGE_FILTER;

export const judgeQuery = (filter: JudgeFilter) =>
  filter === DEFAULT_JUDGE_FILTER ? "" : `?status=${filter}`;

/**
 * A row the Judge sees. It carries no author field at all, so an anonymous contest cannot leak one
 * (BR-PRJ-08, AC-27); `label` is "Karya 3" by the order of sending.
 */
export type JudgeRow = {
  id: string;
  label: string;
  title: string;
  genre: string;
  words: number;
  mine: JuryScore | undefined;
};

export function judgeRows(
  works: readonly Submission[],
  scores: readonly JuryScore[],
  judgeId: string,
): JudgeRow[] {
  return works.map((work, i) => ({
    id: work.id,
    label: `Karya ${i + 1}`,
    title: work.title,
    genre: work.genre,
    words: work.versions.at(-1)?.wordCount ?? 0,
    mine: scores.find(
      (s) => s.submissionId === work.id && canonicalId(s.judgeId) === canonicalId(judgeId),
    ),
  }));
}

export const applyJudgeFilter = (rows: readonly JudgeRow[], filter: JudgeFilter): JudgeRow[] =>
  rows.filter((r) => filter === "semua" || (filter === "sudah") === (r.mine !== undefined));

export const countJudgeFilters = (rows: readonly JudgeRow[]): Record<JudgeFilter, number> => ({
  belum: rows.filter((r) => !r.mine).length,
  sudah: rows.filter((r) => r.mine).length,
  semua: rows.length,
});

export const judgeEmptyText: Record<JudgeFilter, string> = {
  belum: "Semua karya sudah kamu nilai.",
  sudah: "Belum ada karya yang kamu nilai.",
  semua: "Belum ada karya yang dikirim ke lomba ini.",
};
