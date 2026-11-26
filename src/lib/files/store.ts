import type { FileStore } from "./file-store";
import { projectFileStore } from "./project-file-store";

/** Uses the private `project-files` bucket when signed in, IndexedDB for visitors and tests. */
export function fileStore(): FileStore {
  return projectFileStore();
}
