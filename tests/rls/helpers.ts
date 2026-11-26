import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// RLS tests talk to a real Supabase project (the one configured in .env.local or .env), not to
// jsdom. They create throwaway users prefixed `rls-test-` with the service role and remove them
// (and the audit rows they caused) afterwards. Run them with `npm run test:rls`.

function loadEnvFiles(): void {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

loadEnvFiles();

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. RLS tests need the Supabase keys in .env.local.`);
  return value;
}

const url = need("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = need("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const secretKey = need("SUPABASE_SECRET_KEY");

const options = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Service role: bypasses RLS. Used only to prepare and clean up fixtures. */
export const admin: SupabaseClient = createClient(url, secretKey, options);

/** Anonymous visitor: publishable key, no session. */
export function anonClient(): SupabaseClient {
  return createClient(url, publishableKey, options);
}

export type TestUser = { id: string; email: string; client: SupabaseClient };

const created: string[] = [];

/** Creates a confirmed user (the profile row comes from the on_auth_user_created trigger). */
export async function createTestUser(label: string): Promise<TestUser> {
  const email = `rls-test-${label}-${randomUUID().slice(0, 8)}@example.com`;
  const password = `Aa1-${randomUUID()}`;
  const made = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (made.error || !made.data.user) throw new Error(`createUser failed: ${made.error?.message}`);
  const id = made.data.user.id;
  created.push(id);
  const client = anonClient();
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw new Error(`signIn failed: ${signedIn.error.message}`);
  return { id, email, client };
}

/** Removes the audit rows the tests caused, then the users (profiles and roles cascade). */
export async function cleanupTestUsers(): Promise<void> {
  if (created.length === 0) return;
  const ids = [...created];
  created.length = 0;
  const list = ids.join(",");
  for (const id of ids) {
    for (const bucket of [
      "avatars",
      "studio-covers",
      "community-images",
      "project-posters",
      "project-files",
    ]) {
      const files = await admin.storage.from(bucket).list(id);
      const paths = (files.data ?? []).map((file) => `${id}/${file.name}`);
      if (paths.length > 0) await admin.storage.from(bucket).remove(paths);
    }
  }
  await admin.from("audit_log").delete().or(`actor_id.in.(${list}),target_id.in.(${list})`);
  for (const id of ids) await admin.auth.admin.deleteUser(id);
}
