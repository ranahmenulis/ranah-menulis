import type { ProfileUpdate } from "./profile-mapping";

/** What saving a profile change came to. Screens show a message for each failure. */
export type SaveResult = "ok" | "username-taken" | "photo-failed" | "failed";

export type PhotoResult = { ok: true; path: string; url: string } | { ok: false };

/**
 * Where a signed-in account's profile and photo are written. Supabase in the app; tests pass their
 * own, so no screen talks to a database directly (same idea as `DocumentStore`).
 */
export type AccountGateway = {
  /**
   * Writes the given columns of the profile row. `username-taken` when the unique username is
   * already used; `failed` for anything else (offline, rejected, not the owner).
   */
  updateProfile(
    userId: string,
    update: Partial<ProfileUpdate>,
  ): Promise<"ok" | "username-taken" | "failed">;
  /** Stores a photo given as a data URL in the user's own folder and returns where it can be read. */
  uploadPhoto(userId: string, dataUrl: string): Promise<PhotoResult>;
  /** Removes the user's stored photo files; never throws (a leftover file is harmless). */
  removePhoto(userId: string): Promise<void>;
};
