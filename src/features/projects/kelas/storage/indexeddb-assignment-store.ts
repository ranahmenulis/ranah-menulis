import type { AssignmentSubmission } from "../types";
import { canAdd, type AssignmentStore } from "./assignment-store";

const DB_NAME = "ranah-kelas";
const DB_VERSION = 1;
const ASSIGNMENTS = "assignments";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(ASSIGNMENTS, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Assignments handed in from this device, with their frozen versions. */
export function createIndexedDbAssignmentStore(): AssignmentStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => (dbPromise ??= open());

  return {
    async list() {
      const tx = (await db()).transaction(ASSIGNMENTS, "readonly");
      return (await request(tx.objectStore(ASSIGNMENTS).getAll())) as AssignmentSubmission[];
    },

    async add(submission) {
      // One read-write transaction: the check and the write cannot be split by another tab.
      const tx = (await db()).transaction(ASSIGNMENTS, "readwrite");
      const store = tx.objectStore(ASSIGNMENTS);
      const existing = (await request(store.getAll())) as AssignmentSubmission[];
      const verdict = canAdd(existing, submission);
      if (verdict !== "ok") return verdict;
      store.put(submission);
      await done(tx);
      return "ok";
    },

    async update(id, change) {
      const tx = (await db()).transaction(ASSIGNMENTS, "readwrite");
      const store = tx.objectStore(ASSIGNMENTS);
      const current = (await request(store.get(id))) as AssignmentSubmission | undefined;
      if (!current) return "missing";
      const next = change(current);
      if (!next) return "rejected";
      store.put(next);
      await done(tx);
      return "ok";
    },
  };
}
