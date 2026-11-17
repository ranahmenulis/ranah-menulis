import type { SubmissionStatus } from "@/components/ui/status-submission";
import type { Submission } from "@/features/projects/submission-types";
import {
  MAX_REVISIONS,
  canMove,
  revisionsSent,
  type Decision,
} from "@/features/projects/submission-status";
import type { ManagerRole } from "@/lib/roles";
import { reviewAccess, type ReviewAccess } from "./assignments";

export type Step = {
  decision: Decision;
  label: string;
  /** Mulai tinjau is a single click; every other step needs the reason PRD 10.5 asks for. */
  needsReason: boolean;
  /** Why the step cannot be taken right now, shown instead of a dead button. */
  blocked?: string;
};

const STEPS: Record<Decision, Omit<Step, "decision">> = {
  peninjauan: { label: "Mulai tinjau", needsReason: false },
  "perlu-revisi": { label: "Minta revisi", needsReason: true },
  diterima: { label: "Terima", needsReason: true },
  ditolak: { label: "Tolak", needsReason: true },
};

const ORDER: readonly Decision[] = ["peninjauan", "perlu-revisi", "diterima", "ditolak"];

/** The steps the transition table allows from the current status (PRD 10.5), in a fixed order. */
export function stepsFor(work: Submission): Step[] {
  return ORDER.filter((decision) => canMove(work.status, decision)).map((decision) => ({
    decision,
    ...STEPS[decision],
    ...(decision === "perlu-revisi" && revisionsSent(work) >= MAX_REVISIONS
      ? { blocked: "Batas putaran revisi sudah tercapai. Putuskan Terima atau Tolak." }
      : {}),
  }));
}

/** What the dialog says before a step that the participant will be told about. */
export const stepCopy: Record<Exclude<Decision, "peninjauan">, { title: string; hint: string }> = {
  "perlu-revisi": {
    title: "Minta revisi",
    hint: "Peserta mendapat tenggat tujuh hari untuk mengirim revisi. Tulis apa yang perlu diperbaiki.",
  },
  diterima: {
    title: "Terima karya ini",
    hint: "Keputusan ini final dan peserta akan diberi tahu. Tulis alasannya.",
  },
  ditolak: {
    title: "Tolak karya ini",
    hint: "Keputusan ini final dan peserta akan diberi tahu. Tulis alasan yang bisa mereka baca.",
  },
};

export type ReviewTarget =
  | { status: "gone" }
  | { status: "blocked"; reason: Exclude<ReviewAccess, "ok"> }
  | { status: "ready"; work: Submission };

/** One submission by id, or why it cannot be opened by these roles. */
export function resolveReview(
  submissions: readonly Submission[],
  id: string,
  roles: readonly ManagerRole[],
): ReviewTarget {
  const work = submissions.find((s) => s.id === id && s.status !== "draf");
  if (!work) return { status: "gone" };
  const access = reviewAccess(roles, work.slug);
  return access === "ok" ? { status: "ready", work } : { status: "blocked", reason: access };
}

export const blockedMessage: Record<Exclude<ReviewAccess, "ok">, string> = {
  "tidak-ditugaskan": "Karya ini tidak ditugaskan kepadamu.",
  "bukan-karya-editor":
    "Karya ini tidak ditinjau lewat antrean Editor. Lomba dinilai Juri, dan tugas kelas diperiksa Mentor.",
};

/** What the status means for the reviewer, in one sentence (the participant reads another one). */
export const reviewerHint: Record<SubmissionStatus, string> = {
  draf: "Karya ini belum dikirim.",
  terkirim: "Karya ini menunggu kamu mulai meninjau.",
  peninjauan: "Karya ini sedang ditinjau. Putuskan untuk menerima, menolak, atau meminta revisi.",
  "perlu-revisi": "Menunggu revisi dari peserta.",
  "revisi-terkirim": "Peserta sudah mengirim revisi dan menunggu kamu meninjau lagi.",
  diterima: "Karya ini sudah diterima.",
  ditolak: "Karya ini sudah ditolak.",
  ditarik: "Peserta menarik karya ini, jadi tidak perlu ditinjau lagi.",
};
