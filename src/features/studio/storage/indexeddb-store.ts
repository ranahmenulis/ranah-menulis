import { dayKey, emptyLog, type DailyLog } from "../daily-progress";
import {
  commitSave,
  type DocumentStore,
  type SaveInput,
  type SaveResult,
  type StudioDocument,
} from "./document-store";

const DB_NAME = "ranah-studio";
const DB_VERSION = 1;
const DOCS = "documents";
const DAILY = "daily";

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
      req.result.createObjectStore(DOCS, { keyPath: "id" });
      req.result.createObjectStore(DAILY, { keyPath: "day" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Documents on this device. `save` reads, checks the version, and writes inside one readwrite
 * transaction, so two tabs (standing in for two devices) cannot both win: the second one gets a
 * conflict instead of overwriting.
 */
export function createIndexedDbStore(): DocumentStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => (dbPromise ??= open());

  return {
    async get(id) {
      const tx = (await db()).transaction(DOCS, "readonly");
      return ((await request(tx.objectStore(DOCS).get(id))) as StudioDocument | undefined) ?? null;
    },

    async save(input: SaveInput, baseVersion: number): Promise<SaveResult> {
      const tx = (await db()).transaction([DOCS, DAILY], "readwrite");
      const docs = tx.objectStore(DOCS);
      const daily = tx.objectStore(DAILY);
      const today = dayKey(new Date());

      const existing = ((await request(docs.get(input.id))) as StudioDocument | undefined) ?? null;
      const log = ((await request(daily.get(today))) as DailyLog | undefined) ?? emptyLog();
      const result = commitSave(existing, input, baseVersion, log, Date.now());

      if (result.ok) {
        docs.put(result.doc);
        daily.put(result.progress);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      return result;
    },

    async today() {
      const tx = (await db()).transaction(DAILY, "readonly");
      const log = (await request(tx.objectStore(DAILY).get(dayKey(new Date())))) as
        DailyLog | undefined;
      return log ?? emptyLog();
    },

    async duplicate(source, title) {
      const copy: StudioDocument = {
        ...source,
        id: crypto.randomUUID(),
        title,
        version: 1,
        updatedAt: Date.now(),
      };
      const tx = (await db()).transaction(DOCS, "readwrite");
      tx.objectStore(DOCS).put(copy);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return copy;
    },
  };
}
