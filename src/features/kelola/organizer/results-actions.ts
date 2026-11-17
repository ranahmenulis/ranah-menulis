import { contestStage } from "@/features/projects/lomba/contest-model";
import { storedResults } from "@/features/projects/lomba/results-store";
import { readOverrides } from "@/features/projects/lomba/stage-store";
import type { ContestResults } from "@/features/projects/lomba/types";
import type { Project } from "@/features/projects/types";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit } from "../audit/audit-log";
import { ME_ID } from "../identity";
import { reasonMessage, validateReason } from "../reason";
import { readEffectiveRoles } from "../use-effective-roles";
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
  | {
      ok: false;
      reason: "terkunci" | "belum-ditutup" | "salah" | "bukan-admin" | "alasan";
      errors: ResultsErrors;
      message?: string;
    };

/** Once the finalists are announced they stay as recorded, whatever the form says. */
function fixFinalists(
  input: ResultsInput,
  rows: readonly RankRow[],
  kept: ContestResults | undefined,
  fixed: boolean,
): ResultsInput {
  if (!fixed || !kept) return input;
  const finalists = Object.fromEntries(
    rows.map((r) => [r.id, kept.finalists.some((f) => f.id === r.id)]),
  );
  return { ...input, finalists };
}

/** Why a correction after the announcement may not go ahead: not an Administrator, or no reason. */
function amendRefusal(reason: string): SaveResultsOutcome | null {
  if (!isPlatformAdmin(readEffectiveRoles())) {
    return { ok: false, reason: "bukan-admin", errors: {} };
  }
  const problem = validateReason(reason, true);
  if (!problem) return null;
  const message = problem === "kosong" ? "Tulis alasan perubahannya." : reasonMessage[problem];
  return { ok: false, reason: "alasan", errors: {}, message };
}

/**
 * Keeps the finalists and winners (LMB-02). The stage and the closing of judging are read again
 * when the button is pressed, because the page may have been open while either changed. Once the
 * finalists are announced the finalists stay as they were and only the winners are taken from the
 * form. After the winners are announced only an Administrator can still change them, with a reason
 * that goes to the audit log (PRD 17.5: an announcement does not change without an audit note).
 */
export function saveContestResults(
  project: Project,
  rows: readonly RankRow[],
  input: ResultsInput,
  now: number,
  amend?: { reason: string },
): SaveResultsOutcome {
  const stage = contestStage(project, now, readOverrides()[project.slug]?.stage);
  const judging = judgingStatus(stage, judgingLog.read(), project.slug);
  const lock = resultsLock(stage, judging);
  const amending = lock === "terkunci" && amend !== undefined;
  if (lock === "belum-ditutup" || (lock === "terkunci" && !amending)) {
    return { ok: false, reason: lock, errors: {} };
  }
  const refused = amending && amend ? amendRefusal(amend.reason) : null;
  if (refused) return refused;

  const kept = storedResults.read().find((r) => r.slug === project.slug);
  const effective = fixFinalists(input, rows, kept, lock === "finalis-tetap" || amending);
  const prizes = project.block.kind === "lomba" ? project.block.prizes.length : 0;
  const errors = validateResults(effective, rows, prizes);
  if (Object.keys(errors).length > 0) return { ok: false, reason: "salah", errors };

  const results = buildResults(project.slug, rows, effective);
  const rest = storedResults.read().filter((r) => r.slug !== project.slug);
  storedResults.write([...rest, results]);
  if (amend && amending) {
    appendAudit([
      {
        action: "contest.results.amend",
        actorId: ME_ID,
        slug: project.slug,
        reason: amend.reason.trim(),
      },
    ]);
  }
  return { ok: true, results };
}
