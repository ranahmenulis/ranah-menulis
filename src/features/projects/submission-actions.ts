import { notifySubmissionsChanged } from "./storage/submission-events";
import type { Change, SubmissionStore } from "./storage/submission-store";
import { withDecision, withWithdrawal, type Decision } from "./submission-status";

/** `rejected`: the rules no longer allow it (another tab got there first, or the deadline passed). */
export type ActionResult = "ok" | "rejected" | "missing" | "failed";

async function run(store: SubmissionStore, id: string, change: Change): Promise<ActionResult> {
  try {
    const verdict = await store.update(id, change);
    if (verdict === "ok") notifySubmissionsChanged();
    return verdict;
  } catch {
    return "failed";
  }
}

/** The clock is read here, when the button is pressed, not when the page opened. */
export const withdrawSubmission = (store: SubmissionStore, id: string) =>
  run(store, id, (current) => withWithdrawal(current, Date.now()));

/**
 * A reviewer's step. Only the development-only panel calls it until the Editor and Judge panels
 * exist (6g); they will call the same function.
 */
export const reviewSubmission = (
  store: SubmissionStore,
  id: string,
  decision: Decision,
  reason?: string,
) => run(store, id, (current) => withDecision(current, decision, { now: Date.now(), reason }));
