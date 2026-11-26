import { accountSession } from "@/features/studio/storage/store";
import type { AssignmentStore } from "./assignment-store";
import { createIndexedDbAssignmentStore } from "./indexeddb-assignment-store";
import {
  createSupabaseAssignmentStore,
  createSwitchingAssignmentStore,
} from "./remote/supabase-assignment-store";

let device: AssignmentStore | null = null;
let remote: { userId: string; store: AssignmentStore } | null = null;

function deviceStore(): AssignmentStore {
  device ??= createIndexedDbAssignmentStore();
  return device;
}

async function accountStore(): Promise<AssignmentStore | null> {
  const session = await accountSession();
  if (!session) return null;
  if (remote?.userId !== session.userId) {
    remote = {
      userId: session.userId,
      store: createSupabaseAssignmentStore(session.client, session.userId),
    };
  }
  return remote.store;
}

/** Uses Supabase when signed in and IndexedDB when browsing as a visitor or in tests. */
export const assignmentStore = createSwitchingAssignmentStore(deviceStore, accountStore);
