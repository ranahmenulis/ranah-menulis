import { contestStage } from "@/features/projects/lomba/contest-model";
import { storedResults } from "@/features/projects/lomba/results-store";
import { readOverrides } from "@/features/projects/lomba/stage-store";
import type { ContestResults } from "@/features/projects/lomba/types";
import type { Project } from "@/features/projects/types";
import { judgingStatus } from "../juri/judge-model";
import { judgingLog } from "../juri/score-store";
import {
  buildResults,
  resultsLock,
  validateResults,
  type RankRow,
  type ResultsErrors,
  type ResultsInput,
} from "./results-model";

export type SaveResultsOutcome =
  | { ok: true; results: ContestResults }
  | { ok: false; reason: "terkunci" | "belum-ditutup" | "salah"; errors: ResultsErrors };

/**
 * Keeps the finalists and winners (LMB-02). The stage and the closing of judging are read again
 * when the button is pressed, because the page may have been open while either changed. Once the
 * finalists are announced the finalists stay as they were and only the winners are taken from the
 * form.
 */
export function saveContestResults(
  project: Project,
  rows: readonly RankRow[],
  input: ResultsInput,
  now: number,
): SaveResultsOutcome {
  const stage = contestStage(project, now, readOverrides()[project.slug]?.stage);
  const judging = judgingStatus(stage, judgingLog.read(), project.slug);
  const lock = resultsLock(stage, judging);
  if (lock === "terkunci" || lock === "belum-ditutup")
    return { ok: false, reason: lock, errors: {} };

  const kept = storedResults.read().find((r) => r.slug === project.slug);
  const effective: ResultsInput =
    lock === "finalis-tetap" && kept
      ? {
          ...input,
          finalists: Object.fromEntries(
            rows.map((r) => [r.id, kept.finalists.some((f) => f.id === r.id)]),
          ),
        }
      : input;
  const prizes = project.block.kind === "lomba" ? project.block.prizes.length : 0;
  const errors = validateResults(effective, rows, prizes);
  if (Object.keys(errors).length > 0) return { ok: false, reason: "salah", errors };

  const results = buildResults(project.slug, rows, effective);
  const rest = storedResults.read().filter((r) => r.slug !== project.slug);
  storedResults.write([...rest, results]);
  return { ok: true, results };
}
