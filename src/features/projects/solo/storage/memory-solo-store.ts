import type { SoloProgress } from "../types";
import type { SoloStore } from "./solo-store";

/** In-memory store with the same behaviour as the IndexedDB one. Used by tests. */
export function createMemorySoloStore(): SoloStore {
  const rows = new Map<string, SoloProgress>();
  return {
    async list() {
      return [...rows.values()];
    },
    async add(row) {
      if (rows.has(row.id)) return "duplicate";
      rows.set(row.id, row);
      return "ok";
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
