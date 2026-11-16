import { createIndexedDbAssignmentStore } from "./indexeddb-assignment-store";

/** The one assignment store for the app. Swapped for the Supabase store when the backend exists. */
export const assignmentStore = createIndexedDbAssignmentStore();
