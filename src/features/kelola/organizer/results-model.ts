import { ME_ID } from "@/features/community/fixtures/authors";
import { stageRank } from "@/features/projects/lomba/contest-model";
import type { ContestResults, ContestStage } from "@/features/projects/lomba/types";
import type { Submission } from "@/features/projects/submission-types";
import {
  NOTE_LIMIT,
  aggregateScore,
  judgeableWorks,
  type Criterion,
  type JudgingStatus,
} from "../juri/judge-model";
import type { JuryScore } from "../juri/score-store";

/** One work in the ranking the Organizer decides from (LMB-02). */
export type RankRow = {
  id: string;
  /** "Karya 3": the order of sending, the same label the Judges saw. */
  label: string;
  title: string;
  genre: string;
  /** The mean over the Judges who scored it; `null` when nobody has. */
  score: number | null;
  judges: number;
};

/** Works from the highest score down; unscored ones last, in the order they were sent. */
export function rankRows(
  works: readonly Submission[],
  scores: readonly JuryScore[],
  criteria: readonly Criterion[],
  slug: string,
): RankRow[] {
  const rows = judgeableWorks(works, slug).map((work, i) => {
    const mine = scores.filter((s) => s.submissionId === work.id);
    return {
      id: work.id,
      label: `Karya ${i + 1}`,
      title: work.title,
      genre: work.genre,
      score: aggregateScore(criteria, mine),
      judges: mine.length,
      order: i,
    };
  });
  return rows
    .sort((a, b) => {
      if (a.score === null || b.score === null) {
        return a.score === b.score ? a.order - b.order : a.score === null ? 1 : -1;
      }
      return b.score - a.score || a.order - b.order;
    })
    .map((r) => ({
      id: r.id,
      label: r.label,
      title: r.title,
      genre: r.genre,
      score: r.score,
      judges: r.judges,
    }));
}

// ---- what may be edited ---------------------------------------------------------------------

/**
 * What the Organizer may still change (PRD 17.5: an announcement cannot change without an audit
 * note, and that screen comes in 6g-6). [usulan] Results are set only after judging is closed;
 * once the finalists are announced the finalists are fixed and only the winners can change; once
 * the winners are announced nothing can.
 */
export type ResultsLock = "belum-ditutup" | "terbuka" | "finalis-tetap" | "terkunci";

export function resultsLock(stage: ContestStage, judging: JudgingStatus): ResultsLock {
  if (stage === "pemenang") return "terkunci";
  if (judging !== "ditutup") return "belum-ditutup";
  return stageRank(stage) >= stageRank("finalis") ? "finalis-tetap" : "terbuka";
}

export const lockText: Record<Exclude<ResultsLock, "terbuka">, string> = {
  "belum-ditutup": "Hasil bisa ditetapkan setelah penilaian ditutup.",
  "finalis-tetap": "Finalis sudah diumumkan dan tidak bisa diubah. Pemenang masih bisa ditetapkan.",
  terkunci: "Pemenang sudah diumumkan. Pengumuman tidak bisa diubah.",
};

// ---- the form -------------------------------------------------------------------------------

export type ResultsInput = {
  finalists: Record<string, boolean>;
  /** Text as typed; empty means "not a winner". */
  ranks: Record<string, string>;
  notes: Record<string, string>;
};

export type ResultsErrors = Record<string, string>;
export const FINALISTS_KEY = "finalists";

/** The form for results already on record (a work no longer listed is dropped). */
export function inputOf(
  results: ContestResults | undefined,
  rows: readonly RankRow[],
): ResultsInput {
  const input: ResultsInput = { finalists: {}, ranks: {}, notes: {} };
  for (const row of rows) {
    const winner = results?.winners.find((w) => w.entryId === row.id);
    input.finalists[row.id] = results?.finalists.some((f) => f.id === row.id) ?? false;
    input.ranks[row.id] = winner ? String(winner.rank) : "";
    input.notes[row.id] = winner?.jurorNote ?? "";
  }
  return input;
}

/** One message per rule that fails; nothing typed is dropped. */
export function validateResults(
  input: ResultsInput,
  rows: readonly RankRow[],
  prizeCount: number,
): ResultsErrors {
  const errors: ResultsErrors = {};
  if (!rows.some((r) => input.finalists[r.id])) {
    errors[FINALISTS_KEY] = "Pilih minimal satu finalis.";
  }
  for (const { id } of rows) {
    const rank = (input.ranks[id] ?? "").trim();
    if (rank === "") continue;
    const value = /^\d{1,3}$/.test(rank) ? Number(rank) : NaN;
    if (!input.finalists[id]) errors[`rank-${id}`] = "Hanya finalis yang bisa menjadi pemenang.";
    else if (!Number.isInteger(value) || value < 1 || value > prizeCount) {
      errors[`rank-${id}`] = `Isi peringkat 1 sampai ${prizeCount} (jumlah hadiah).`;
    }
    if ((input.notes[id] ?? "").trim().length > NOTE_LIMIT) {
      errors[`note-${id}`] =
        `Catatan paling banyak ${NOTE_LIMIT.toLocaleString("id-ID")} karakter.`;
    }
  }
  return errors;
}

/**
 * The results to keep. A finalist is a real work, with the dummy account as its author until real
 * accounts exist. Winners come out in rank order; equal ranks are a tie (PRD 17.5).
 */
export function buildResults(
  slug: string,
  rows: readonly RankRow[],
  input: ResultsInput,
): ContestResults {
  const finalists = rows
    .filter((r) => input.finalists[r.id])
    .map((r) => ({ id: r.id, title: r.title, genre: r.genre, authorId: ME_ID }));
  const winners = finalists
    .flatMap((f) => {
      const rank = (input.ranks[f.id] ?? "").trim();
      return rank === ""
        ? []
        : [{ entryId: f.id, rank: Number(rank), jurorNote: (input.notes[f.id] ?? "").trim() }];
    })
    .sort((a, b) => a.rank - b.rank);
  return { slug, finalists, winners };
}
