import type { SoloProgress } from "../types";
import type { SoloStore } from "./solo-store";

const DB_NAME = "ranah-solo";
const DB_VERSION = 1;
const ROWS = "progress";

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
      req.result.createObjectStore(ROWS, { keyPath: "id" });
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

/** Solo progress kept on this device. */
export function createIndexedDbSoloStore(): SoloStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => {
    dbPromise ??= open().catch((error) => {
      // A failed open must not stick: the retry button has to be able to try again.
      dbPromise = null;
      throw error;
    });
    return dbPromise;
  };

  return {
    async list() {
      const tx = (await db()).transaction(ROWS, "readonly");
      return (await request(tx.objectStore(ROWS).getAll())) as SoloProgress[];
    },

    async add(row) {
      const tx = (await db()).transaction(ROWS, "readwrite");
      const store = tx.objectStore(ROWS);
      if ((await request(store.get(row.id))) !== undefined) return "duplicate";
      store.put(row);
      await done(tx);
      return "ok";
    },

    async update(id, change) {
      const tx = (await db()).transaction(ROWS, "readwrite");
      const store = tx.objectStore(ROWS);
      const current = (await request(store.get(id))) as SoloProgress | undefined;
      if (!current) return "missing";
      const next = change(current);
      if (!next) return "rejected";
      store.put(next);
      await done(tx);
      return "ok";
    },
  };
}
