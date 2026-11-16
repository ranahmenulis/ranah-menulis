import type { AssignmentSubmission } from "../types";
import { canAdd, type AssignmentStore } from "./assignment-store";

/** In-memory store with the same behaviour as the IndexedDB one. Used by tests. */
export function createMemoryAssignmentStore(): AssignmentStore {
  const rows = new Map<string, AssignmentSubmission>();
  return {
    async list() {
      return [...rows.values()];
    },
    async add(submission) {
      const verdict = canAdd([...rows.values()], submission);
      if (verdict === "ok") rows.set(submission.id, submission);
      return verdict;
    },
    async update(id, change) {
      const current = rows.get(id);
      if (!current) return "missing";
      const next = change(current);
      if (!next) return "rejected";
      rows.set(id, next);
      return "ok";
    },
  };
}
