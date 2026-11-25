import { connection } from "next/server";
import { readSupabasePublicEnv } from "@/lib/env";
import { GUEST_SESSION } from "@/lib/auth/session-info";
import { createClient } from "@/lib/supabase/server";
import type { ManagerRole } from "@/lib/roles";
import { emptyAccount, rowToAccount, type ProfileRow } from "./profile-mapping";
import type { SessionSnapshot } from "./session-types";

const GUEST: SessionSnapshot = { session: GUEST_SESSION, account: null };

/** Platform roles in the database, named the way the screens name them. */
const ROLE_NAMES: Record<string, ManagerRole> = {
  administrator: "administrator",
  super_admin: "super-admin",
};

/**
 * Reads who is signed in for this request (server only; reads the session cookie). The claims are
 * verified, then the profile and the platform roles are read with the user's own session, so Row
 * Level Security applies. Any problem reads as a visitor: the page must still render.
 */
export async function readSession(): Promise<SessionSnapshot> {
  const env = readSupabasePublicEnv();
  if (!env) return GUEST;
  try {
    // Verifying the token reads the clock. Waiting for the request first keeps that read out of
    // prerendering (Next 16 rejects `Date.now()` there); the session is per request anyway.
    await connection();
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return GUEST;
    const [profile, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", claims.sub).maybeSingle(),
      supabase.from("platform_roles").select("role").eq("user_id", claims.sub),
    ]);
    const email = typeof claims.email === "string" ? claims.email : "";
    const account = profile.data
      ? rowToAccount(profile.data as ProfileRow, {
          email,
          supabaseUrl: env.url.replace(/\/$/, ""),
        })
      : emptyAccount(email);
    const platformRoles = (roles.data ?? [])
      .map((row) => ROLE_NAMES[String(row.role)])
      .filter((role): role is ManagerRole => role !== undefined);
    return { session: { status: "user", userId: claims.sub, platformRoles }, account };
  } catch {
    return GUEST;
  }
}
