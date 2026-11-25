// The account's shape and its pure helpers. Deliberately NOT a client module: the server reads the
// session with these (`session.ts`), and anything imported from a "use client" file is only an
// opaque reference on the server. The device store and the hooks live in `account-store.ts`.

import {
  DEFAULT_NOTIFICATION_PREFS,
  mergeNotificationPrefs,
  parseNotificationPrefs,
  type NotificationPrefs,
  type NotificationPrefsPatch,
} from "@/features/notifications/preferences";
import { GENRES, type Genre } from "@/features/community/types";
import { DEFAULT_TIME_ZONE, isTimeZone, type Country } from "./timezones";
import {
  DEFAULT_WRITING_PREFERENCES,
  parseWritingPreferences,
  type WritingPreferences,
} from "./writing-preferences";

export type AccountProfile = {
  name: string;
  username: string;
  bio: string;
  country: Country;
  timeZone: string;
  genres: Genre[];
  /** A small data URL made from the chosen photo; null shows the initials. */
  avatar: string | null;
};

export type AccountPrefs = {
  /** Per event, in the app and by email, for those PRD 20 lets the reader turn off (PLT-11). */
  notifications: NotificationPrefs;
  /** Whether the streak shows on the public profile. Private is the default (Brief). */
  showStreak: boolean;
  writing: WritingPreferences;
};

export type Account = {
  email: string;
  /**
   * True for an account made on the Daftar screen on this device. It starts with no posts,
   * followers, or notifications; the untouched dummy reader (no stored account) does not set it.
   */
  registered?: boolean;
  /** ISO time the account was made; shown as "Anggota sejak". */
  memberSince: string;
  /** ISO time of the last password change; null when it was never changed here. */
  passwordChangedAt: string | null;
  profile: AccountProfile;
  prefs: AccountPrefs;
};

export type AccountPatch = {
  email?: string;
  registered?: boolean;
  memberSince?: string;
  passwordChangedAt?: string | null;
  profile?: Partial<AccountProfile>;
  prefs?: Partial<Omit<AccountPrefs, "writing" | "notifications">> & {
    writing?: Partial<WritingPreferences>;
    notifications?: NotificationPrefsPatch;
  };
};

/**
 * The dummy reader (same person as DUMMY_USER and the Community author "me") until real accounts
 * exist. Whatever the reader saves on the account screens is kept on top of this, on this device.
 */
export const DEFAULT_ACCOUNT: Account = {
  email: "rinjani@contoh.id",
  memberSince: "2026-11-01T00:00:00.000Z",
  passwordChangedAt: null,
  profile: {
    name: "Rinjani Putri",
    username: "rinjaniputri",
    bio: "Menulis cerpen dan esai tentang rumah, hujan, dan orang-orang yang menunggu.",
    country: "ID",
    timeZone: DEFAULT_TIME_ZONE,
    genres: ["Cerpen", "Esai"],
    avatar: null,
  },
  prefs: {
    notifications: DEFAULT_NOTIFICATION_PREFS,
    showStreak: false,
    writing: DEFAULT_WRITING_PREFERENCES,
  },
};

const text = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback);
const flag = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);
const isoOr = (value: unknown, fallback: string | null) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : fallback;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Reads storage defensively: a broken or old value falls back field by field, never throws. */
export function parseAccount(raw: string | null): Account {
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  if (!isRecord(data)) return DEFAULT_ACCOUNT;
  const d = DEFAULT_ACCOUNT;
  const p = isRecord(data.profile) ? data.profile : {};
  const f = isRecord(data.prefs) ? data.prefs : {};
  const genres = Array.isArray(p.genres)
    ? GENRES.filter((genre) => (p.genres as unknown[]).includes(genre))
    : d.profile.genres;
  return {
    email: text(data.email, d.email),
    ...(data.registered === true ? { registered: true } : {}),
    memberSince: isoOr(data.memberSince, d.memberSince) ?? d.memberSince,
    passwordChangedAt: isoOr(data.passwordChangedAt, null),
    profile: {
      name: text(p.name, d.profile.name),
      username: text(p.username, d.profile.username),
      bio: text(p.bio, d.profile.bio),
      country: p.country === "MY" ? "MY" : "ID",
      timeZone: isTimeZone(p.timeZone) ? p.timeZone : d.profile.timeZone,
      genres,
      // A device photo is a data URL; a signed-in account's photo is an https address (Storage).
      avatar:
        typeof p.avatar === "string" &&
        (p.avatar.startsWith("data:image/") || p.avatar.startsWith("https://"))
          ? p.avatar
          : null,
    },
    prefs: {
      notifications: parseNotificationPrefs(f.notifications, f),
      showStreak: flag(f.showStreak, d.prefs.showStreak),
      writing: parseWritingPreferences(f.writing),
    },
  };
}

export function mergeAccount(current: Account, patch: AccountPatch): Account {
  return {
    email: patch.email ?? current.email,
    ...((patch.registered ?? current.registered) ? { registered: true } : {}),
    memberSince: patch.memberSince ?? current.memberSince,
    passwordChangedAt:
      patch.passwordChangedAt === undefined ? current.passwordChangedAt : patch.passwordChangedAt,
    profile: { ...current.profile, ...patch.profile },
    prefs: {
      ...current.prefs,
      ...patch.prefs,
      writing: { ...current.prefs.writing, ...patch.prefs?.writing },
      notifications: mergeNotificationPrefs(
        current.prefs.notifications,
        patch.prefs?.notifications,
      ),
    },
  };
}
