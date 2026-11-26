import { accountSession } from "@/features/studio/storage/store";
import { createIndexedDbSoloStore } from "./indexeddb-solo-store";
import { createSupabaseSoloStore, createSwitchingSoloStore } from "./remote/supabase-solo-store";
import type { SoloStore } from "./solo-store";

let device: SoloStore | null = null;
let remote: { userId: string; store: SoloStore } | null = null;

function deviceStore(): SoloStore {
  device ??= createIndexedDbSoloStore();
  return device;
}

async function accountStore(): Promise<SoloStore | null> {
  const session = await accountSession();
  if (!session) return null;
  if (remote?.userId !== session.userId) {
    remote = {
      userId: session.userId,
      store: createSupabaseSoloStore(session.client),
    };
  }
  return remote.store;
}

/** Uses Supabase when signed in and IndexedDB when browsing as a visitor or in tests. */
export const soloStore = createSwitchingSoloStore(deviceStore, accountStore);
