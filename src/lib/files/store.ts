import type { FileStore } from "./file-store";
import { createIndexedDbFileStore } from "./indexeddb-file-store";

let store: FileStore | null = null;

/** The files of this device; created on first use in the browser. */
export function fileStore(): FileStore {
  store ??= createIndexedDbFileStore();
  return store;
}
