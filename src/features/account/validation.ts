/**
 * Field rules for the account screens. Each function returns an issue code (or null), never text,
 * so the screens can show the message in the reader's language. Limits are [usulan]: the PRD only
 * says "weak passwords are rejected" and "username is unique" (PLT-01, PLT-02).
 */
export type Issue =
  | "required"
  | "emailInvalid"
  | "passwordShort"
  | "passwordLong"
  | "passwordWeak"
  | "passwordMismatch"
  | "usernameShort"
  | "usernameLong"
  | "usernameChars"
  | "usernameReserved"
  | "usernameTaken"
  | "nameLong"
  | "bioLong"
  | "photoType"
  | "photoSize"
  | "agreeRequired";

export const PASSWORD_MIN = 8;
/** bcrypt, which Supabase Auth uses, ignores everything after 72 bytes. */
export const PASSWORD_MAX = 72;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const NAME_MAX = 60;
export const BIO_MAX = 160;
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Names that would collide with routes or read as official accounts [usulan]. */
const RESERVED = new Set([
  "admin",
  "administrator",
  "ranah",
  "ranahmenulis",
  "studio",
  "projects",
  "jelajahi",
  "beranda",
  "masuk",
  "daftar",
  "pengaturan",
  "support",
]);

export function emailIssue(value: string): Issue | null {
  const email = value.trim();
  if (!email) return "required";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "emailInvalid";
  return null;
}

/** Sign-in only asks that something was typed; the strength rules belong to choosing a password. */
export function passwordPresent(value: string): Issue | null {
  return value ? null : "required";
}

/**
 * Same rule as the Supabase Auth setting "lowercase, uppercase, digits and symbols": the server
 * rejects anything else, so the screens must ask for exactly this before sending.
 */
export const PASSWORD_PARTS = {
  lower: /\p{Ll}/u,
  upper: /\p{Lu}/u,
  number: /\d/,
  symbol: /[!-/:-@[-`{-~]/,
} as const;

const meetsComplexity = (value: string) =>
  Object.values(PASSWORD_PARTS).every((part) => part.test(value));

export function passwordIssue(value: string): Issue | null {
  if (!value) return "required";
  if (value.length < PASSWORD_MIN) return "passwordShort";
  if (new TextEncoder().encode(value).length > PASSWORD_MAX) return "passwordLong";
  if (!meetsComplexity(value)) return "passwordWeak";
  return null;
}

export function confirmIssue(password: string, confirmation: string): Issue | null {
  if (!confirmation) return "required";
  return password === confirmation ? null : "passwordMismatch";
}

/** Usernames are lower case; typing capitals is forgiven by normalising before the checks. */
export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export function usernameIssue(value: string, taken: (username: string) => boolean): Issue | null {
  const username = normalizeUsername(value);
  if (!username) return "required";
  if (username.length < USERNAME_MIN) return "usernameShort";
  if (username.length > USERNAME_MAX) return "usernameLong";
  if (!/^[a-z0-9_]+$/.test(username)) return "usernameChars";
  if (RESERVED.has(username)) return "usernameReserved";
  return taken(username) ? "usernameTaken" : null;
}

export function nameIssue(value: string): Issue | null {
  const name = value.trim();
  if (!name) return "required";
  return Array.from(name).length > NAME_MAX ? "nameLong" : null;
}

export function bioIssue(value: string): Issue | null {
  return Array.from(value.trim()).length > BIO_MAX ? "bioLong" : null;
}

export function photoIssue(file: { type: string; size: number }): Issue | null {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return "photoType";
  return file.size > PHOTO_MAX_BYTES ? "photoSize" : null;
}
