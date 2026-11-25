import type { ProfileUpdate } from "./profile-mapping";

/**
 * Where a signed-in account's profile is written. Supabase in the app; tests pass their own, so
 * no screen talks to a database directly (same idea as `DocumentStore`).
 */
export type AccountGateway = {
  /** True when the row was updated. False for any failure (offline, rejected, not the owner). */
  updateProfile(userId: string, update: ProfileUpdate): Promise<boolean>;
};
