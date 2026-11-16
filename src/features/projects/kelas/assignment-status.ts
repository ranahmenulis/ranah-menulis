import type { SubmissionVersion } from "../submission-types";
import type { AssignmentStatus, AssignmentSubmission } from "./types";

/**
 * Where an assignment may go next [usulan: the PRD only names "selesai" and "perlu perbaikan",
 * KLS-03]. After "perlu perbaikan" the participant hands in again, which puts it back to
 * "dikumpulkan" for the mentor. Nothing is skipped and nothing leaves "selesai".
 */
const NEXT: Record<AssignmentStatus, readonly AssignmentStatus[]> = {
  dikumpulkan: ["perlu-perbaikan", "selesai"],
  "perlu-perbaikan": ["dikumpulkan"],
  selesai: [],
};

export const canMove = (from: AssignmentStatus, to: AssignmentStatus) => NEXT[from].includes(to);

/** What the status means for the participant, in one sentence. */
export const statusHint: Record<AssignmentStatus, string> = {
  dikumpulkan: "Tugasmu sudah terkirim dan menunggu mentor.",
  "perlu-perbaikan": "Mentor meminta perbaikan. Baca catatannya, lalu kumpulkan lagi.",
  selesai: "Mentor menandai tugas ini selesai.",
};

export type MentorDecision = "perlu-perbaikan" | "selesai";

/** The mentor's latest note: on the decision that put the work where it is now. */
export function latestFeedback(s: AssignmentSubmission): string | null {
  return s.statusLog.findLast((c) => c.by === "mentor" && c.reason)?.reason ?? null;
}

function logged(
  s: AssignmentSubmission,
  status: AssignmentStatus,
  change: { at: number; by: "peserta" | "mentor"; reason?: string },
): AssignmentSubmission {
  return { ...s, status, statusLog: [...s.statusLog, { status, ...change }] };
}

/**
 * The mentor's step (the Mentor panel comes in 6g; a development-only panel calls this until
 * then). `null` when the table does not allow it, or when a repair is asked for without saying
 * what to repair: the participant has nothing to act on otherwise.
 */
export function withMentorDecision(
  s: AssignmentSubmission,
  decision: MentorDecision,
  input: { now: number; reason?: string },
): AssignmentSubmission | null {
  if (!canMove(s.status, decision)) return null;
  const reason = input.reason?.trim();
  if (decision === "perlu-perbaikan" && !reason) return null;
  return logged(s, decision, { at: input.now, by: "mentor", ...(reason ? { reason } : {}) });
}

/** Why a new hand-in cannot be made; `null` means it can. Only after "perlu perbaikan". */
export type ResubmitBlock = "bukan-perlu-perbaikan";

export function resubmitBlock(s: AssignmentSubmission): ResubmitBlock | null {
  return canMove(s.status, "dikumpulkan") ? null : "bukan-perlu-perbaikan";
}

/** A new version on top of the old ones, which stay (BR-STD-03). No limit on rounds [usulan]. */
export function withResubmission(
  s: AssignmentSubmission,
  input: {
    version: SubmissionVersion;
    source: AssignmentSubmission["source"];
    docId: string | null;
    docTitle: string;
    now: number;
  },
): AssignmentSubmission | null {
  if (resubmitBlock(s) !== null) return null;
  const { version, source, docId, docTitle, now } = input;
  return {
    ...logged(s, "dikumpulkan", { at: now, by: "peserta" }),
    source,
    docId,
    docTitle,
    versions: [...s.versions, { ...version, version: s.versions.length + 1 }],
  };
}
