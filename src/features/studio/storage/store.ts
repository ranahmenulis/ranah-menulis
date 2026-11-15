import { createIndexedDbStore } from "./indexeddb-store";

/** The one document store for the app. Swapped for the Supabase store when the backend exists. */
export const studioStore = createIndexedDbStore();
