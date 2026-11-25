import type { DocumentStore } from "../document-store";

/**
 * One `DocumentStore` for the whole app that decides per call where the documents live: in the
 * account (Supabase) when someone is signed in, on this device (IndexedDB) otherwise.
 *
 * The choice is made inside each call, not when the app starts, because the session is only known
 * asynchronously and can change (sign in, sign out) while pages stay mounted. Every method of the
 * store is already asynchronous, so waiting for the answer changes nothing for callers.
 */
export function createSwitchingStore(
  local: () => DocumentStore,
  /** The account store when signed in, or null. Must not throw: failures mean "not signed in". */
  remote: () => Promise<DocumentStore | null>,
): DocumentStore {
  return new Proxy({} as DocumentStore, {
    get(_target, method: string) {
      return async (...args: unknown[]) => {
        const store = (await remote()) ?? local();
        const fn = store[method as keyof DocumentStore] as (...a: unknown[]) => unknown;
        return fn.apply(store, args);
      };
    },
  });
}
