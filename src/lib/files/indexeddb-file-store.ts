import type { FileStore, StoredFile } from "./file-store";

const DB_NAME = "ranah-files";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function finished(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Files (manuscripts, previews) in their own IndexedDB, apart from the document and post stores. */
export function createIndexedDbFileStore(): FileStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => {
    dbPromise ??= open().catch((error) => {
      dbPromise = null;
      throw error;
    });
    return dbPromise;
  };
  return {
    async put(file) {
      const tx = (await db()).transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file);
      await finished(tx);
    },
    async get(id) {
      const tx = (await db()).transaction(STORE, "readonly");
      return ((await request(tx.objectStore(STORE).get(id))) as StoredFile | undefined) ?? null;
    },
    async delete(id) {
      const tx = (await db()).transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      await finished(tx);
    },
  };
}
