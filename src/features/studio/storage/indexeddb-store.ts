import { dayKey, emptyLog, type DailyLog } from "../daily-progress";
import {
  applyMeta,
  commitSave,
  type DocumentMeta,
  type DocumentStore,
  type SaveInput,
  type SaveResult,
  type StudioDocument,
  type StudioFolder,
} from "./document-store";

const DB_NAME = "ranah-studio";
const DB_VERSION = 2;
const DOCS = "documents";
const DAILY = "daily";
const FOLDERS = "folders";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      if (event.oldVersion < 1) {
        db.createObjectStore(DOCS, { keyPath: "id" });
        db.createObjectStore(DAILY, { keyPath: "day" });
      }
      if (event.oldVersion < 2) db.createObjectStore(FOLDERS, { keyPath: "id" });
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

    async list() {
      const tx = (await db()).transaction(DOCS, "readonly");
      return (await request(tx.objectStore(DOCS).getAll())) as StudioDocument[];
    },

    async listFolders() {
      const tx = (await db()).transaction(FOLDERS, "readonly");
      return (await request(tx.objectStore(FOLDERS).getAll())) as StudioFolder[];
    },

    async history() {
      const tx = (await db()).transaction(DAILY, "readonly");
      const logs = (await request(tx.objectStore(DAILY).getAll())) as DailyLog[];
      return logs.sort((a, b) => a.day.localeCompare(b.day));
    },

    async updateMeta(id: string, patch: DocumentMeta) {
      const tx = (await db()).transaction(DOCS, "readwrite");
      const store = tx.objectStore(DOCS);
      const existing = (await request(store.get(id))) as StudioDocument | undefined;
      if (!existing) return null;
      const next = applyMeta(existing, patch, Date.now());
      store.put(next);
      await done(tx);
      return next;
    },

    async deletePermanently(id: string) {
      const tx = (await db()).transaction(DOCS, "readwrite");
      tx.objectStore(DOCS).delete(id);
      await done(tx);
    },

    async importHistory(logs: DailyLog[]) {
      const tx = (await db()).transaction(DAILY, "readwrite");
      for (const log of logs) tx.objectStore(DAILY).put(log);
      await done(tx);
    },

    async createFolder(name: string) {
      const folder: StudioFolder = { id: crypto.randomUUID(), name, createdAt: Date.now() };
      const tx = (await db()).transaction(FOLDERS, "readwrite");
      tx.objectStore(FOLDERS).put(folder);
      await done(tx);
      return folder;
    },

    async renameFolder(id: string, name: string) {
      const tx = (await db()).transaction(FOLDERS, "readwrite");
      const store = tx.objectStore(FOLDERS);
      const folder = (await request(store.get(id))) as StudioFolder | undefined;
      if (folder) store.put({ ...folder, name });
      await done(tx);
    },
  };
}
