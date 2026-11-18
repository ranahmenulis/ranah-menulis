import type { Comment } from "../types";
import type { Marks, PostStore, StoredPost } from "./post-store";

const DB_NAME = "ranah-community";
const DB_VERSION = 1;
const POSTS = "posts";
const COMMENTS = "comments";
const MARKS = "marks";

type MarkRow = { key: string; value: boolean };

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
      const db = req.result;
      db.createObjectStore(POSTS, { keyPath: "id" });
      db.createObjectStore(COMMENTS, { keyPath: "id" });
      db.createObjectStore(MARKS, { keyPath: "key" });
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

/** Community data on this device: posts and drafts written here, comments, and the reader's marks. */
export function createIndexedDbPostStore(): PostStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => {
    dbPromise ??= open().catch((error) => {
      dbPromise = null;
      throw error;
    });
    return dbPromise;
  };

  async function getAll<T>(name: string): Promise<T[]> {
    const tx = (await db()).transaction(name, "readonly");
    return (await request(tx.objectStore(name).getAll())) as T[];
  }

  async function put(name: string, value: unknown): Promise<void> {
    const tx = (await db()).transaction(name, "readwrite");
    tx.objectStore(name).put(value);
    await done(tx);
  }

  return {
    listPosts: () => getAll<StoredPost>(POSTS),

    async getPost(id) {
      const tx = (await db()).transaction(POSTS, "readonly");
      return ((await request(tx.objectStore(POSTS).get(id))) as StoredPost | undefined) ?? null;
    },

    putPost: (post) => put(POSTS, post),

    async deletePost(id) {
      const tx = (await db()).transaction(POSTS, "readwrite");
      tx.objectStore(POSTS).delete(id);
      await done(tx);
    },

    listComments: () => getAll<Comment>(COMMENTS),

    putComment: (comment) => put(COMMENTS, comment),

    async listMarks() {
      const rows = await getAll<MarkRow>(MARKS);
      const marks: Marks = {};
      for (const row of rows) marks[row.key] = row.value;
      return marks;
    },

    setMark: (key, value) => put(MARKS, { key, value } satisfies MarkRow),
  };
}
