import { authors } from "@/features/community/fixtures/authors";

/**
 * Stand-in for Supabase Auth while sign-in is bypassed (decision 16 November 2026: forms only
 * validate, then move to the next screen). There is no session and nothing is checked against a
 * server. A few addresses exist only so every state can be seen:
 *
 * - `salah@…` fails sign-in with wrong credentials
 * - `belum@…` fails sign-in as an unverified email
 * - `terdaftar@…` cannot sign up (already registered)
 *
 * Remove this file together with the bypass when real auth arrives (R1).
 */
const localPart = (email: string) => email.trim().toLowerCase().split("@")[0] ?? "";

export type SignInResult = { ok: true } | { ok: false; reason: "credentials" | "unverified" };

export function simulateSignIn(email: string): SignInResult {
  const name = localPart(email);
  if (name === "salah") return { ok: false, reason: "credentials" };
  if (name === "belum") return { ok: false, reason: "unverified" };
  return { ok: true };
}

export function simulateSignUp(email: string): { ok: true } | { ok: false; reason: "exists" } {
  return localPart(email) === "terdaftar" ? { ok: false, reason: "exists" } : { ok: true };
}

/** Usernames of the dummy authors, plus the reader's own, count as taken (PLT-02, unique). */
const TAKEN = new Set(authors.map((author) => author.handle));

/** `own` is the reader's current username, which is not "taken" for the reader. */
export function usernameTaken(username: string, own?: string): boolean {
  return username !== own && TAKEN.has(username);
}
