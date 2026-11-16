import type { JSONContent } from "@tiptap/react";
import type { SubmissionStatus } from "@/components/ui/status-submission";

/** Solo asks for the kind of book instead of a genre (SOL-01); the others use Community's genres. */
export const BOOK_TYPES = [
  "Novel",
  "Kumpulan puisi",
  "Memoar",
  "Esai",
  "Nonfiksi",
  "Kumpulan cerpen",
] as const;

export const NOTE_LIMIT = 500;
export const SYNOPSIS_LIMIT = 1500;
export const TITLE_LIMIT = 120;

/**
 * A frozen copy of a Studio document (STD-09, BR-STD-03): it never changes when the document is
 * edited. A revision (6f-4) adds a new version; the old one stays.
 */
export type SubmissionVersion = {
  version: number;
  content: JSONContent;
  wordCount: number;
  /** SHA-256 of the canonical JSON of `content`, in hex. */
  hash: string;
  frozenAt: number;
};

/**
 * Every status change is recorded: who, when, and why (BR-PRJ-05). `reason` is the editor's note
 * on a decision, or the participant's note on a revision. `dueAt` is the revision deadline, only on
 * a change to Perlu Revisi.
 */
export type StatusChange = {
  status: SubmissionStatus;
  at: number;
  by: "peserta" | "sistem" | "editor";
  reason?: string;
  dueAt?: number;
};

/**
 * A submission kept on this device. Becomes a database row when the backend exists; the shape is
 * ready for revisions (`versions`) and for the review states of 6f-4 and 6g.
 */
export type Submission = {
  id: string;
  /** The project it was sent to. */
  slug: string;
  title: string;
  /** Genre, or the kind of book for Solo. */
  genre: string;
  /** Note for the editor. Empty when none was written. */
  note: string;
  /** Solo only. */
  synopsis?: string;
  /** Solo only: the package chosen at registration. */
  packageName?: string;
  /** When the participant confirmed the work is their own. */
  originalityAgreedAt: number;
  docId: string;
  /** Title of the document when it was sent, kept in case the document is deleted later. */
  docTitle: string;
  status: SubmissionStatus;
  statusLog: StatusChange[];
  versions: SubmissionVersion[];
  submittedAt: number;
};
