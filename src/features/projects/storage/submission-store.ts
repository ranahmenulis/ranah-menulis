import type { Submission } from "../submission-types";

export type AddResult = "ok" | "duplicate" | "limit";

/**
 * Where submissions live. Today: this device (IndexedDB). The Supabase store replaces it after the
 * design is approved; screens only see this interface.
 */
export interface SubmissionStore {
  list(): Promise<Submission[]>;
  /**
   * Stores a new submission unless it breaks a rule that two tabs could race on: the same document
   * sent twice to one project, or more works than the project allows. Checked and written together.
   */
  add(submission: Submission, maxWorks: number): Promise<AddResult>;
}

/** Pure rule shared by every store; a withdrawn work no longer counts. */
export function canAdd(existing: Submission[], next: Submission, maxWorks: number): AddResult {
  const active = existing.filter((s) => s.slug === next.slug && s.status !== "ditarik");
  if (active.some((s) => s.docId === next.docId)) return "duplicate";
  if (active.length >= maxWorks) return "limit";
  return "ok";
}
