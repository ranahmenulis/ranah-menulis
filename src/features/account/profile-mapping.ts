import { parseAccount, type Account } from "./account-model";

/** One row of `public.profiles` (migrations 0001 and 0003). */
export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_path: string | null;
  country: string | null;
  timezone: string | null;
  genres: string[] | null;
  prefs: unknown;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

/** The columns the account screens write (the photo and onboarding have their own steps). */
export type ProfileUpdate = {
  display_name: string | null;
  username: string | null;
  bio: string | null;
  country: string;
  timezone: string;
  genres: string[];
  prefs: Record<string, unknown>;
  /** Set when the profile is finished (Mulai); a stored time, never cleared. */
  onboarded_at: string;
  /** The photo's path in the avatars bucket, or null once it is removed. */
  avatar_path: string | null;
};

/** Public address of a stored photo; the version changes whenever the profile does (cache busting). */
export function avatarUrl(
  base: string | null,
  path: string | null,
  updatedAt: string,
): string | null {
  if (!base || !path) return null;
  return `${base}/storage/v1/object/public/avatars/${path}?v=${Date.parse(updatedAt) || 0}`;
}

/**
 * A real account is built from its profile row. It always starts from an empty world
 * (`registered: true`: none of the sample posts or followers belong to it). The same defensive
 * parsing as the device store runs over it, so a broken value falls back field by field.
 */
export function rowToAccount(
  row: ProfileRow,
  context: { email: string; supabaseUrl: string | null },
): Account {
  const prefs = typeof row.prefs === "object" && row.prefs !== null ? row.prefs : {};
  return parseAccount(
    JSON.stringify({
      email: context.email,
      registered: true,
      memberSince: row.created_at,
      profile: {
        name: row.display_name ?? "",
        username: row.username ?? "",
        bio: row.bio ?? "",
        country: row.country ?? "ID",
        timeZone: row.timezone ?? undefined,
        genres: row.genres ?? [],
        avatar: avatarUrl(context.supabaseUrl, row.avatar_path, row.updated_at),
      },
      prefs,
    }),
  );
}

/** An account for a signed-in user whose profile row could not be read (still usable, but empty). */
export function emptyAccount(email: string): Account {
  return rowToAccount(
    {
      id: "",
      username: null,
      display_name: null,
      bio: null,
      avatar_path: null,
      country: null,
      timezone: null,
      genres: null,
      prefs: {},
      onboarded_at: null,
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
    },
    { email, supabaseUrl: null },
  );
}

/** What to write to the profile row for the given account (empty text is stored as null). */
export function accountToUpdate(
  account: Account,
): Omit<ProfileUpdate, "onboarded_at" | "avatar_path"> {
  const { profile, prefs } = account;
  return {
    display_name: profile.name.trim() || null,
    username: profile.username.trim() || null,
    bio: profile.bio.trim() || null,
    country: profile.country,
    timezone: profile.timeZone,
    genres: profile.genres,
    prefs: JSON.parse(JSON.stringify(prefs)) as Record<string, unknown>,
  };
}
