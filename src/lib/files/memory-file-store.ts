import type { FileStore, StoredFile } from "./file-store";

/** In-memory store for tests. */
export function createMemoryFileStore(): FileStore {
  const files = new Map<string, StoredFile>();
  return {
    async put(file) {
      files.set(file.id, file);
    },
    async get(id) {
      return files.get(id) ?? null;
    },
    async delete(id) {
      files.delete(id);
    },
  };
}
