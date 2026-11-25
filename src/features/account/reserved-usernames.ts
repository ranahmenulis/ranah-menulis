import { authors } from "@/features/community/fixtures/authors";

/**
 * Usernames of the sample Community authors count as taken (PLT-02, unique). The database checks
 * the real ones (unique index); this only keeps the sample authors' handles off limits.
 */
const TAKEN = new Set(authors.map((author) => author.handle));

/** `own` is the reader's current username, which is not "taken" for the reader. */
export function usernameTaken(username: string, own?: string): boolean {
  return username !== own && TAKEN.has(username);
}
