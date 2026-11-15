import { createIndexedDbPostStore } from "./indexeddb-post-store";

/** The one Community store for the app. Swapped for the Supabase store when the backend exists. */
export const postStore = createIndexedDbPostStore();
