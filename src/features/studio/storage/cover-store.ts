import type { FileStore } from "@/lib/files/file-store";
import { fileStore } from "@/lib/files/store";
import { createSupabaseFileStore } from "@/lib/files/supabase-file-store";
import { accountSession } from "./store";

let remote: { userId: string; store: FileStore } | null = null;

async function activeCoverStore(): Promise<FileStore> {
  const session = await accountSession();
  if (!session) return fileStore();
  if (remote?.userId !== session.userId) {
    remote = {
      userId: session.userId,
      store: createSupabaseFileStore(session.client, "studio-covers", session.userId),
    };
  }
  return remote.store;
}

/**
 * Where book covers live: the signed-in account's private `studio-covers` bucket, or this
 * device's IndexedDB for visitors.
 */
export const coverFileStore: FileStore = {
  async put(file) {
    return (await activeCoverStore()).put(file);
  },
  async get(id) {
    return (await activeCoverStore()).get(id);
  },
  async delete(id) {
    return (await activeCoverStore()).delete(id);
  },
};
