import { stageRank } from "@/features/projects/lomba/contest-model";
import type { ContestStage } from "@/features/projects/lomba/types";
import { validateReason } from "../reason";
import { isClosed, validateScores, type Criterion, type ScoreErrors } from "./judge-model";
import { JUDGE_ID, judgingLog, juryScores, type JuryScore } from "./score-store";

export type SaveResult =
  { ok: true; score: JuryScore } | { ok: false; reason: "ditutup" | "salah"; errors: ScoreErrors };

/**
 * Saves the viewer's scores for a work. Reads the closing log again when the button is pressed:
 * a Judge cannot change a score once judging is closed (BR-PRJ-09, AC-28), even from a form that
 * was opened before. Saving again replaces the earlier scores of the same Judge for that work.
 */
export function saveJuryScore(
  target: { slug: string; submissionId: string; criteria: readonly Criterion[] },
  input: Record<string, string>,
  note: string,
  now: number,
): SaveResult {
  if (isClosed(judgingLog.read(), target.slug)) {
    return { ok: false, reason: "ditutup", errors: {} };
  }
  const { errors, scores } = validateScores(target.criteria, input, note);
  if (Object.keys(errors).length > 0) return { ok: false, reason: "salah", errors };
  const score: JuryScore = {
    submissionId: target.submissionId,
    slug: target.slug,
    judgeId: JUDGE_ID,
    scores,
    note: note.trim(),
    at: now,
  };
  const rest = juryScores
    .read()
    .filter((s) => !(s.submissionId === score.submissionId && s.judgeId === score.judgeId));
  juryScores.write([...rest, score]);
  return { ok: true, score };
}

export type ClosureResult = "ok" | "sudah-berubah" | "belum-waktunya" | "catatan";

/** The Organizer closes judging. Only once the contest stopped taking work, and only once. */
export function closeJudging(slug: string, stage: ContestStage, now: number): ClosureResult {
  const log = judgingLog.read();
  if (isClosed(log, slug)) return "sudah-berubah";
  if (stageRank(stage) < stageRank("dinilai")) return "belum-waktunya";
  judgingLog.write([...log, { slug, state: "ditutup", at: now }]);
  return "ok";
}

/**
 * An Administrator reopens judging, with a note that stays in the log (BR-PRJ-09). Whether the
 * viewer is an Administrator is decided by the screen; the database does it later.
 */
export function reopenJudging(slug: string, note: string, now: number): ClosureResult {
  const log = judgingLog.read();
  if (!isClosed(log, slug)) return "sudah-berubah";
  if (validateReason(note, true) !== null) return "catatan";
  judgingLog.write([...log, { slug, state: "dibuka", at: now, note: note.trim() }]);
  return "ok";
}
