import { createIndexedDbSoloStore } from "./indexeddb-solo-store";

/** The one Solo store for the app. Swapped for the Supabase store when the backend exists. */
export const soloStore = createIndexedDbSoloStore();
