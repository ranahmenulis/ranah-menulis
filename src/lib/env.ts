// NEXT_PUBLIC_* variables must be written out literally (not read through a dynamic key),
// otherwise Next.js cannot inline them into the browser bundle.

type SupabasePublicEnv = { url: string; publishableKey: string };

/** Returns the public Supabase settings, or null when they are not configured yet. */
export function readSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/** Same as readSupabasePublicEnv, but fails fast with an actionable message. */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const env = readSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Copy .env.example to .env.local and fill it in.",
    );
  }
  return env;
}
