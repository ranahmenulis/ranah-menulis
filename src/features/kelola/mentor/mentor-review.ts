import { mentorCopy } from "./copy/mentor-copy";
import { canMove, type MentorDecision } from "@/features/projects/kelas/assignment-status";
import type { Locale } from "@/lib/i18n/config";
import type { AssignmentStatus, AssignmentSubmission } from "@/features/projects/kelas/types";

export type MentorStep = {
  decision: MentorDecision;
  label: string;
  /** A repair must say what to repair (the participant has nothing to act on otherwise). */
  required: boolean;
};

const STEPS: readonly MentorStep[] = [
  { decision: "perlu-perbaikan", label: "Minta perbaikan", required: true },
  { decision: "selesai", label: "Tandai selesai", required: false },
];

/** The steps the transition table allows from the current status, nothing else. */
export const mentorStepsFor = (work: AssignmentSubmission, locale: Locale = "id"): MentorStep[] =>
  STEPS.filter((s) => canMove(work.status, s.decision)).map((s) => ({
    ...s,
    label: mentorCopy(locale).decision.steps[s.decision].label,
  }));

export const mentorStepCopy: Record<
  MentorDecision,
  { title: string; hint: string; fieldLabel: string }
> = mentorCopy("id").decision.steps;

export const mentorStepCopyOf = (decision: MentorDecision, locale: Locale = "id") =>
  mentorCopy(locale).decision.steps[decision];

/** What the status means for the mentor, in one sentence. */
export const mentorHint: Record<AssignmentStatus, string> = mentorCopy("id").hint;

export const mentorHintOf = (status: AssignmentStatus, locale: Locale = "id"): string =>
  mentorCopy(locale).hint[status];
