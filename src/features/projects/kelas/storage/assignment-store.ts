import type { AssignmentSubmission } from "../types";

export type AddResult = "ok" | "duplicate";
export type UpdateResult = "ok" | "missing" | "rejected";

/** Computes the next version of one assignment from its current one. `null` refuses the change. */
export type Change = (current: AssignmentSubmission) => AssignmentSubmission | null;

/**
 * Where handed-in assignments live. Today: this device (IndexedDB). The Supabase store replaces it
 * after the design is approved; screens only see this interface.
 */
export interface AssignmentStore {
  list(): Promise<AssignmentSubmission[]>;
  /**
   * Stores a new hand-in unless this assignment was already handed in (checked and written
   * together, so two tabs cannot both succeed). A repeat goes through `update` as a resubmission.
   */
  add(submission: AssignmentSubmission): Promise<AddResult>;
  /** Reads, changes and writes one row in one transaction. */
  update(id: string, change: Change): Promise<UpdateResult>;
}

/** Pure rule shared by every store: one hand-in per assignment of a class. */
export function canAdd(existing: AssignmentSubmission[], next: AssignmentSubmission): AddResult {
  const taken = existing.some((s) => s.slug === next.slug && s.assignmentId === next.assignmentId);
  return taken ? "duplicate" : "ok";
}
