import { accountSession } from "@/features/studio/storage/store";
import type { FileStore } from "./file-store";
import { createIndexedDbFileStore } from "./indexeddb-file-store";
import { createSupabaseFileStore } from "./supabase-file-store";

function createSwitchingBucketStore(bucket: string): FileStore {
  let device: FileStore | null = null;
  let remote: { userId: string; store: FileStore } | null = null;

  const local = () => {
    device ??= createIndexedDbFileStore();
    return device;
  };

  async function active(): Promise<FileStore> {
    const session = await accountSession();
    if (!session) return local();
    if (remote?.userId !== session.userId) {
      remote = {
        userId: session.userId,
        store: createSupabaseFileStore(session.client, bucket, session.userId),
      };
    }
    return remote.store;
  }

  return {
    put: async (file) => (await active()).put(file),
    get: async (id) => (await active()).get(id),
    delete: async (id) => (await active()).delete(id),
  };
}

let posters: FileStore | null = null;
let files: FileStore | null = null;

/** Public `project-posters` bucket when signed in, IndexedDB otherwise. */
export function projectPosterStore(): FileStore {
  posters ??= createSwitchingBucketStore("project-posters");
  return posters;
}

/** Private `project-files` bucket when signed in, IndexedDB otherwise. */
export function projectFileStore(): FileStore {
  files ??= createSwitchingBucketStore("project-files");
  return files;
}
