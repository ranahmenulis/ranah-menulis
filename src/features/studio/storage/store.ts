import { readAccount } from "@/features/account/account-store";
import { createClient } from "@/lib/supabase/client";
import type { DocumentStore } from "./document-store";
import { createIndexedDbStore } from "./indexeddb-store";
import { createSupabaseStore } from "./remote/supabase-store";
import { createSwitchingStore } from "./remote/switching-store";

let local: DocumentStore | null = null;
let account: { client: ReturnType<typeof createClient>; store: DocumentStore } | null = null;

/** The documents of this device: where visitors write and where older documents still live. */
export const deviceStore = () => (local ??= createIndexedDbStore());

/** The signed-in session's client and document store, or null for visitors or when Supabase is not set up. */
export async function accountSession(): Promise<{
  client: ReturnType<typeof createClient>;
  store: DocumentStore;
} | null> {
  try {
    if (!account) {
      const client = createClient();
      account = {
        client,
        store: createSupabaseStore(client, () => readAccount().profile.timeZone),
      };
    }
    const { data } = await account.client.auth.getSession();
    return data.session ? account : null;
  } catch {
    return null;
  }
}

/** The account's documents when a session exists; null for visitors or when Supabase is not set up. */
export const accountStore = async () => (await accountSession())?.store ?? null;

/**
 * The one document store for the app: the account's documents when signed in, this device's
 * otherwise (see `createSwitchingStore`).
 */
export const studioStore = createSwitchingStore(deviceStore, accountStore);
