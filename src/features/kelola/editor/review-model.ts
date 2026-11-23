import type { Locale } from "@/lib/i18n/config";
import type { SubmissionStatus } from "@/components/ui/status-submission";
import type { Submission } from "@/features/projects/submission-types";
import {
  MAX_REVISIONS,
  canMove,
  revisionsSent,
  type Decision,
} from "@/features/projects/submission-status";
import type { ManagerRole } from "@/lib/roles";
import type { ProjectFixture } from "@/features/projects/types";
import type { StaffAssignment } from "../staff-assignments";
import { reviewAccess, type ReviewAccess } from "./assignments";
import { editorCopy, editorId } from "./copy/editor-copy";

export type Step = {
  decision: Decision;
  label: string;
  /** Mulai tinjau is a single click; every other step needs the reason PRD 10.5 asks for. */
  needsReason: boolean;
  /** Why the step cannot be taken right now, shown instead of a dead button. */
  blocked?: string;
};

/** Mulai tinjau is a single click; every other step needs the reason PRD 10.5 asks for. */
const NEEDS_REASON: Record<Decision, boolean> = {
  peninjauan: false,
  "perlu-revisi": true,
  diterima: true,
  ditolak: true,
};

const ORDER: readonly Decision[] = ["peninjauan", "perlu-revisi", "diterima", "ditolak"];

/** The steps the transition table allows from the current status (PRD 10.5), in a fixed order. */
export function stepsFor(work: Submission, locale: Locale = "id"): Step[] {
  const copy = editorCopy(locale).steps;
  return ORDER.filter((decision) => canMove(work.status, decision)).map((decision) => ({
    decision,
    label: copy.labels[decision],
    needsReason: NEEDS_REASON[decision],
    ...(decision === "perlu-revisi" && revisionsSent(work) >= MAX_REVISIONS
      ? { blocked: copy.revisionLimit }
      : {}),
  }));
}

/** What the dialog says before a step that the participant will be told about. */
export const stepCopy: Record<
  Exclude<Decision, "peninjauan">,
  { title: string; hint: string }
> = editorId.steps.dialogs;

export type ReviewTarget =
  | { status: "gone" }
  | { status: "blocked"; reason: Exclude<ReviewAccess, "ok"> }
  | { status: "ready"; work: Submission };

/** One submission by id, or why it cannot be opened by these roles. */
export function resolveReview(
  submissions: readonly Submission[],
  id: string,
  roles: readonly ManagerRole[],
  catalog?: readonly ProjectFixture[],
  assigned?: readonly StaffAssignment[],
): ReviewTarget {
  const work = submissions.find((s) => s.id === id && s.status !== "draf");
  if (!work) return { status: "gone" };
  const access = reviewAccess(roles, work.slug, catalog, assigned);
  return access === "ok" ? { status: "ready", work } : { status: "blocked", reason: access };
}

/** Indonesian sentences; screens read `kelolaEditor.review.blocked`. */
export const blockedMessage: Record<Exclude<ReviewAccess, "ok">, string> = editorId.review.blocked;

/** What the status means for the reviewer, in one sentence (the participant reads another one). */
export const reviewerHint: Record<SubmissionStatus, string> = editorId.review.hints;
