import { createIndexedDbSubmissionStore } from "./indexeddb-submission-store";

/** The one submission store for the app. Swapped for the Supabase store when the backend exists. */
export const submissionStore = createIndexedDbSubmissionStore();
