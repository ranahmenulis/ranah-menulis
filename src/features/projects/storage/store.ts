import { accountSession } from "@/features/studio/storage/store";
import { createIndexedDbSubmissionStore } from "./indexeddb-submission-store";
import {
  createSupabaseSubmissionStore,
  createSwitchingSubmissionStore,
} from "./remote/supabase-submission-store";
import type { SubmissionStore } from "./submission-store";

let device: SubmissionStore | null = null;
let remote: { userId: string; store: SubmissionStore } | null = null;

function deviceStore(): SubmissionStore {
  device ??= createIndexedDbSubmissionStore();
  return device;
}

async function accountStore(): Promise<SubmissionStore | null> {
  const session = await accountSession();
  if (!session) return null;
  if (remote?.userId !== session.userId) {
    remote = {
      userId: session.userId,
      store: createSupabaseSubmissionStore(session.client, session.userId),
    };
  }
  return remote.store;
}

/** Uses Supabase when signed in and IndexedDB when browsing as a visitor or in tests. */
export const submissionStore = createSwitchingSubmissionStore(deviceStore, accountStore);
