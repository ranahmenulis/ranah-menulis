import { accountSession } from "@/features/studio/storage/store";
import { createIndexedDbPostStore } from "./indexeddb-post-store";
import type { PostStore } from "./post-store";
import { createSupabasePostStore } from "./remote/supabase-post-store";
import { createSwitchingPostStore } from "./remote/switching-post-store";

let local: PostStore | null = null;
let remote: PostStore | null = null;

const devicePostStore = () => (local ??= createIndexedDbPostStore());

async function accountPostStore(): Promise<PostStore | null> {
  const session = await accountSession();
  if (!session) return null;
  remote ??= createSupabasePostStore(session.client, async () => {
    const active = await accountSession();
    return active?.userId ?? null;
  });
  return remote;
}

/**
 * The one Community store for the app: the signed-in account's database when a session exists,
 * and this device's IndexedDB otherwise.
 */
export const postStore: PostStore = createSwitchingPostStore(devicePostStore, accountPostStore);
