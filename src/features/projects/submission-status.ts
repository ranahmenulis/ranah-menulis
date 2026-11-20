import type { SubmissionStatus } from "@/components/ui/status-submission";
import type { StatusChange, Submission, SubmissionVersion } from "./submission-types";

/** [usulan, Q-22 is unanswered] Two rounds of revision, seven days to send each. */
export const MAX_REVISIONS = 2;
export const REVISION_DAYS = 7;
const DAY = 86_400_000;

/** The transition table of PRD 10.5: where each status may go next. Nothing can be skipped. */
const NEXT: Record<SubmissionStatus, readonly SubmissionStatus[]> = {
  draf: ["terkirim"],
  terkirim: ["peninjauan", "ditarik"],
  peninjauan: ["perlu-revisi", "diterima", "ditolak"],
  "perlu-revisi": ["revisi-terkirim", "ditarik"],
  "revisi-terkirim": ["peninjauan"],
  diterima: [],
  ditolak: [],
  ditarik: [],
};

export const canMove = (from: SubmissionStatus, to: SubmissionStatus) => NEXT[from].includes(to);

/** What the status means for the participant, in one sentence. */
export const statusHint: Record<SubmissionStatus, string> = {
  draf: "Kamu belum mengirim karya ini.",
  terkirim: "Karyamu sudah diterima dan menunggu peninjau.",
  peninjauan: "Karyamu sedang ditinjau.",
  "perlu-revisi": "Editor meminta perbaikan. Baca catatannya, lalu kirim revisi sebelum tenggat.",
  "revisi-terkirim": "Revisimu sudah terkirim dan menunggu peninjau.",
  diterima: "Karyamu diterima.",
  ditolak: "Karyamu tidak lolos.",
  ditarik: "Kamu sudah menarik karya ini.",
};

/** Revisions the participant has sent so far. */
export const revisionsSent = (s: Submission) =>
  s.statusLog.filter((c) => c.status === "revisi-terkirim").length;

/** The deadline of the revision being asked for; `null` when none is open. */
export function revisionDueAt(s: Submission): number | null {
  if (s.status !== "perlu-revisi") return null;
  return s.statusLog.findLast((c) => c.status === "perlu-revisi")?.dueAt ?? null;
}

/** The editor's latest note: on the decision that put the work where it is now. */
export function latestFeedback(s: Submission): string | null {
  return s.statusLog.findLast((c) => c.by === "editor" && c.reason)?.reason ?? null;
}

/** A work can be withdrawn only before a decision (PRD 10.5). */
export const canWithdraw = (s: Submission) => canMove(s.status, "ditarik");

export type ReviseBlock = "bukan-perlu-revisi" | "putaran-habis" | "tenggat-lewat";

/**
 * Why a revision cannot be sent now; `null` means it can. After the project's deadline only a
 * revision an editor asked for is allowed (PRD 10.5), and then only until its own deadline.
 */
export function reviseBlock(s: Submission, now: number): ReviseBlock | null {
  if (s.status !== "perlu-revisi") return "bukan-perlu-revisi";
  if (revisionsSent(s) >= MAX_REVISIONS) return "putaran-habis";
  const due = revisionDueAt(s);
  if (due !== null && now > due) return "tenggat-lewat";
  return null;
}

export const reviseMessage: Record<ReviseBlock, string> = {
  "bukan-perlu-revisi": "Revisi hanya bisa dikirim saat editor meminta perbaikan.",
  "putaran-habis": "Batas putaran revisi sudah tercapai.",
  "tenggat-lewat": "Tenggat revisi sudah lewat.",
};

function logged(s: Submission, status: SubmissionStatus, change: Omit<StatusChange, "status">) {
  return { ...s, status, statusLog: [...s.statusLog, { status, ...change }] };
}

export type Decision = "peninjauan" | "perlu-revisi" | "diterima" | "ditolak";

/**
 * A reviewer's step (Editor or Judge; the panels come in 6g, a development-only panel calls this
 * until then). `null` when the table does not allow it, or when another round of revision is asked
 * for after the limit: the reviewer must then decide.
 */
export function withDecision(
  s: Submission,
  decision: Decision,
  input: { now: number; reason?: string },
): Submission | null {
  if (!canMove(s.status, decision)) return null;
  if (decision === "perlu-revisi" && revisionsSent(s) >= MAX_REVISIONS) return null;
  const { now, reason } = input;
  return logged(s, decision, {
    at: now,
    by: "editor",
    ...(reason ? { reason } : {}),
    ...(decision === "perlu-revisi" ? { dueAt: now + REVISION_DAYS * DAY } : {}),
  });
}

/** A revision: a new frozen version on top of the old ones, which stay (BR-STD-03). */
export function withRevision(
  s: Submission,
  input: {
    content: SubmissionVersion["content"];
    wordCount: number;
    hash: string;
    docId: string;
    docTitle: string;
    /** Set when the new version is an uploaded file. */
    file?: SubmissionVersion["file"];
    note: string;
    now: number;
  },
): Submission | null {
  const { now, note } = input;
  if (reviseBlock(s, now) !== null) return null;
  const version: SubmissionVersion = {
    version: s.versions.length + 1,
    content: input.content,
    wordCount: input.wordCount,
    hash: input.hash,
    frozenAt: now,
    ...(input.file ? { file: input.file } : {}),
  };
  return {
    ...logged(s, "revisi-terkirim", { at: now, by: "peserta", ...(note ? { reason: note } : {}) }),
    docId: input.docId,
    docTitle: input.docTitle,
    versions: [...s.versions, version],
  };
}

export function withWithdrawal(s: Submission, now: number): Submission | null {
  if (!canWithdraw(s)) return null;
  return logged(s, "ditarik", { at: now, by: "peserta", reason: "Ditarik oleh peserta." });
}
