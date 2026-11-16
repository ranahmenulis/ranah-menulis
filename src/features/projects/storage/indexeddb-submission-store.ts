import type { Submission } from "../submission-types";
import { canAdd, type SubmissionStore } from "./submission-store";

const DB_NAME = "ranah-projects";
const DB_VERSION = 1;
const SUBMISSIONS = "submissions";

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
      req.result.createObjectStore(SUBMISSIONS, { keyPath: "id" });
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

/** Submissions sent from this device, with their frozen versions. */
export function createIndexedDbSubmissionStore(): SubmissionStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => (dbPromise ??= open());

  return {
    async list() {
      const tx = (await db()).transaction(SUBMISSIONS, "readonly");
      return (await request(tx.objectStore(SUBMISSIONS).getAll())) as Submission[];
    },

    async add(submission, maxWorks) {
      // One read-write transaction: the check and the write cannot be split by another tab.
      const tx = (await db()).transaction(SUBMISSIONS, "readwrite");
      const store = tx.objectStore(SUBMISSIONS);
      const existing = (await request(store.getAll())) as Submission[];
      const verdict = canAdd(existing, submission, maxWorks);
      if (verdict !== "ok") return verdict;
      store.put(submission);
      await done(tx);
      return "ok";
    },

    async update(id, change) {
      const tx = (await db()).transaction(SUBMISSIONS, "readwrite");
      const store = tx.objectStore(SUBMISSIONS);
      const all = (await request(store.getAll())) as Submission[];
      const current = all.find((s) => s.id === id);
      if (!current) return "missing";
      const next = change(current, all);
      if (!next) return "rejected";
      store.put(next);
      await done(tx);
      return "ok";
    },
  };
}
