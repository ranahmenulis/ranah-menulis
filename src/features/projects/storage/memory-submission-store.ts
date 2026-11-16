import { canAdd, type SubmissionStore } from "./submission-store";
import type { Submission } from "../submission-types";

/** In-memory store with the same behaviour as the IndexedDB one. Used by tests. */
export function createMemorySubmissionStore(): SubmissionStore {
  const rows = new Map<string, Submission>();
  return {
    async list() {
      return [...rows.values()];
    },
    async add(submission, maxWorks) {
      const verdict = canAdd([...rows.values()], submission, maxWorks);
      if (verdict === "ok") rows.set(submission.id, submission);
      return verdict;
    },
    async update(id, change) {
      const current = rows.get(id);
      if (!current) return "missing";
      const next = change(current, [...rows.values()]);
      if (!next) return "rejected";
      rows.set(id, next);
      return "ok";
    },
  };
}
