import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { deleteOwnAccount } from "./delete-account";
import type { AuthFailure, AuthGateway } from "./auth-gateway";
import {
  RESET_HREF,
  SIGN_IN_HREF,
  SIGN_UP_HREF,
  VERIFY_HREF,
  safeNext,
  withNext,
} from "./redirect";

/**
 * Where an email link lands: `/auth/callback` swaps the code for a session, then goes to `next`
 * (or to `fail` when the link is expired or was opened in another browser).
 */
function callback(next: string, fail: string): string {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next);
  url.searchParams.set("fail", fail);
  return url.toString();
}

const verifyLink = (next?: string | null) =>
  callback(
    withNext(VERIFY_HREF, next, { status: "berhasil" }),
    withNext(VERIFY_HREF, next, { status: "kedaluwarsa" }),
  );

function failureOf(error: AuthError): AuthFailure {
  const text = `${error.code ?? ""} ${error.name}`;
  if (error.status === 429 || /rate_limit/.test(text)) return "limit";
  return "network";
}

/** What setting a new password can come back with, for the reset link and for Pengaturan. */
function passwordFailure(error: AuthError): "same" | "password" | "expired" | AuthFailure {
  if (error.code === "same_password") return "same";
  if (error.code === "weak_password") return "password";
  if (error.name === "AuthSessionMissingError" || error.code === "session_not_found") {
    return "expired";
  }
  return failureOf(error);
}

/** Supabase Auth through the browser client (the session lives in cookies the server reads). */
export const supabaseAuthGateway: AuthGateway = {
  async signIn(email, password) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.code === "invalid_credentials") return { ok: false, reason: "credentials" };
        if (error.code === "email_not_confirmed") return { ok: false, reason: "unverified" };
        return { ok: false, reason: failureOf(error) };
      }
      const profile = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("id", data.user.id)
        .maybeSingle();
      return { ok: true, onboarded: Boolean(profile.data?.onboarded_at) };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async signUp(email, password, next) {
    try {
      const { data, error } = await createClient().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: verifyLink(next) },
      });
      if (error) {
        if (error.code === "user_already_exists") return { ok: false, reason: "exists" };
        if (error.code === "weak_password") return { ok: false, reason: "password" };
        return { ok: false, reason: failureOf(error) };
      }
      // With confirmation on, an address that already has an account comes back without
      // identities (and without a mail): that is how "taken" shows up.
      if (data.user && data.user.identities?.length === 0) return { ok: false, reason: "exists" };
      return { ok: true, verified: Boolean(data.session) };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async resendVerification(email, next) {
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: verifyLink(next) },
      });
      return error ? { ok: false, reason: failureOf(error) } : { ok: true };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async requestPasswordReset(email) {
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: callback(RESET_HREF, withNext(RESET_HREF, null, { status: "kedaluwarsa" })),
      });
      return error ? { ok: false, reason: failureOf(error) } : { ok: true };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async updatePassword(password) {
    try {
      const { error } = await createClient().auth.updateUser({ password });
      return error ? { ok: false, reason: passwordFailure(error) } : { ok: true };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async changePassword(current, next) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) return { ok: false, reason: "network" };
      // Prove the current password first: a left-open tab must not be enough to change it.
      const proof = await supabase.auth.signInWithPassword({ email, password: current });
      if (proof.error) {
        return proof.error.code === "invalid_credentials"
          ? { ok: false, reason: "credentials" }
          : { ok: false, reason: failureOf(proof.error) };
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (!error) return { ok: true };
      const reason = passwordFailure(error);
      return { ok: false, reason: reason === "expired" ? "network" : reason };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async deleteAccount() {
    try {
      const result = await deleteOwnAccount();
      if (!result.ok) return { ok: false, reason: "failed" };
      await createClient().auth.signOut();
      return { ok: true };
    } catch {
      return { ok: false, reason: "failed" };
    }
  },
  async signOut() {
    try {
      await createClient().auth.signOut();
    } catch {
      // Nothing to undo: the server stops trusting the session when its cookie is gone.
    }
  },
  async continueWithGoogle(mode, next) {
    try {
      const url = new URL(
        callback(safeNext(next), withNext(mode === "signUp" ? SIGN_UP_HREF : SIGN_IN_HREF, next)),
      );
      url.searchParams.set("onboarding", "1");
      await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: url.toString() },
      });
      return null;
    } catch {
      return null;
    }
  },
};
