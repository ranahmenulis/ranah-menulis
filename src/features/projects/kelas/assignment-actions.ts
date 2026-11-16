import { withMentorDecision, type MentorDecision } from "./assignment-status";
import { notifyAssignmentsChanged } from "./storage/assignment-events";
import type { AssignmentStore, Change } from "./storage/assignment-store";

/** `rejected`: the table no longer allows it (another tab got there first). */
export type ActionResult = "ok" | "rejected" | "missing" | "failed";

async function run(store: AssignmentStore, id: string, change: Change): Promise<ActionResult> {
  try {
    const verdict = await store.update(id, change);
    if (verdict === "ok") notifyAssignmentsChanged();
    return verdict;
  } catch {
    return "failed";
  }
}

/**
 * The mentor's step. Only the development-only panel calls it until the Mentor panel exists (6g);
 * that panel will call the same function. The clock is read here, when the button is pressed.
 */
export const reviewAssignment = (
  store: AssignmentStore,
  id: string,
  decision: MentorDecision,
  reason?: string,
) =>
  run(store, id, (current) => withMentorDecision(current, decision, { now: Date.now(), reason }));
