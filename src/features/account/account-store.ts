"use client";

import { useMemo, useSyncExternalStore } from "react";
import { GENRES, type Genre } from "@/features/community/types";
import { DEFAULT_TIME_ZONE, isTimeZone, type Country } from "./timezones";
import {
  DEFAULT_WRITING_PREFERENCES,
  parseWritingPreferences,
  type WritingPreferences,
} from "./writing-preferences";

const KEY = "ranah.account";

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
  /** Mail about comments and replies (PRD 20: a summary, can be turned off). */
  emailComments: boolean;
  /** Mail that is not mandatory: deadline reminders and revisions sent. */
  emailProjects: boolean;
  /** Whether the streak shows on the public profile. Private is the default (Brief). */
  showStreak: boolean;
  writing: WritingPreferences;
};

export type Account = {
  email: string;
  /** ISO time the account was made; shown as "Anggota sejak". */
  memberSince: string;
  /** ISO time of the last password change; null when it was never changed here. */
  passwordChangedAt: string | null;
  profile: AccountProfile;
  prefs: AccountPrefs;
};

export type AccountPatch = {
  email?: string;
  memberSince?: string;
  passwordChangedAt?: string | null;
  profile?: Partial<AccountProfile>;
  prefs?: Partial<Omit<AccountPrefs, "writing">> & { writing?: Partial<WritingPreferences> };
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
    emailComments: true,
    emailProjects: true,
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
    memberSince: isoOr(data.memberSince, d.memberSince) ?? d.memberSince,
    passwordChangedAt: isoOr(data.passwordChangedAt, null),
    profile: {
      name: text(p.name, d.profile.name),
      username: text(p.username, d.profile.username),
      bio: text(p.bio, d.profile.bio),
      country: p.country === "MY" ? "MY" : "ID",
      timeZone: isTimeZone(p.timeZone) ? p.timeZone : d.profile.timeZone,
      genres,
      avatar: typeof p.avatar === "string" && p.avatar.startsWith("data:image/") ? p.avatar : null,
    },
    prefs: {
      emailComments: flag(f.emailComments, d.prefs.emailComments),
      emailProjects: flag(f.emailProjects, d.prefs.emailProjects),
      showStreak: flag(f.showStreak, d.prefs.showStreak),
      writing: parseWritingPreferences(f.writing),
    },
  };
}

export function mergeAccount(current: Account, patch: AccountPatch): Account {
  return {
    email: patch.email ?? current.email,
    memberSince: patch.memberSince ?? current.memberSince,
    passwordChangedAt:
      patch.passwordChangedAt === undefined ? current.passwordChangedAt : patch.passwordChangedAt,
    profile: { ...current.profile, ...patch.profile },
    prefs: {
      ...current.prefs,
      ...patch.prefs,
      writing: { ...current.prefs.writing, ...patch.prefs?.writing },
    },
  };
}

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so this tab still shows what was saved. */
let fallback: string | null = null;

function snapshot(): string | null {
  try {
    return fallback ?? window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The saved account on this device; the dummy reader until something is saved. */
export function readAccount(): Account {
  return parseAccount(snapshot());
}

export function useAccount(): Account {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parseAccount(raw), [raw]);
}

/** Returns false when the browser would not keep it (storage full): the caller should say so. */
export function saveAccount(patch: AccountPatch): boolean {
  const next = JSON.stringify(mergeAccount(readAccount(), patch));
  let kept = true;
  try {
    window.localStorage.setItem(KEY, next);
    fallback = null;
  } catch {
    fallback = next;
    kept = false;
  }
  listeners.forEach((listener) => listener());
  return kept;
}

/** Back to the dummy reader (sign-up starts a fresh account, deleting one ends it). */
export function resetAccount() {
  fallback = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing was stored, so there is nothing to remove.
  }
  listeners.forEach((listener) => listener());
}
