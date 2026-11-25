import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthFailure, AuthGateway } from "./auth-gateway";
import { RESET_HREF, VERIFY_HREF, withNext } from "./redirect";

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

/** Supabase Auth through the browser client (the session lives in cookies the server reads). */
export const supabaseAuthGateway: AuthGateway = {
  simulated: false,
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
      if (!error) return { ok: true };
      if (error.code === "same_password") return { ok: false, reason: "same" };
      if (error.code === "weak_password") return { ok: false, reason: "password" };
      if (error.name === "AuthSessionMissingError" || error.code === "session_not_found") {
        return { ok: false, reason: "expired" };
      }
      return { ok: false, reason: failureOf(error) };
    } catch {
      return { ok: false, reason: "network" };
    }
  },
  async signOut() {
    try {
      await createClient().auth.signOut();
    } catch {
      // Nothing to undo: the server stops trusting the session when its cookie is gone.
    }
  },
};
