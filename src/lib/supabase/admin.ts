import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey } from "@/lib/env.server";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Service-role client: BYPASSES RLS. Only for trusted server code
 * (Super Admin setup, payment webhooks). Never import it from a client component.
 */
export function createAdminClient() {
  return createClient(getSupabasePublicEnv().url, getSupabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
