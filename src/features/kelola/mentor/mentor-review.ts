import { canMove, type MentorDecision } from "@/features/projects/kelas/assignment-status";
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
export const mentorStepsFor = (work: AssignmentSubmission): MentorStep[] =>
  STEPS.filter((s) => canMove(work.status, s.decision));

export const mentorStepCopy: Record<
  MentorDecision,
  { title: string; hint: string; fieldLabel: string }
> = {
  "perlu-perbaikan": {
    title: "Minta perbaikan",
    hint: "Peserta membaca catatanmu lalu mengumpulkan lagi. Tulis apa yang perlu diperbaiki.",
    fieldLabel: "Catatan perbaikan",
  },
  selesai: {
    title: "Tandai selesai",
    hint: "Keputusan ini final dan peserta akan diberi tahu. Catatan boleh dikosongkan.",
    fieldLabel: "Catatan",
  },
};

/** What the status means for the mentor, in one sentence. */
export const mentorHint: Record<AssignmentStatus, string> = {
  dikumpulkan: "Tugas ini menunggu penilaianmu.",
  "perlu-perbaikan": "Menunggu perbaikan dari peserta.",
  selesai: "Kamu sudah menandai tugas ini selesai.",
};
