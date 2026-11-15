import "server-only";

/** The service-role key. Server only: importing this from a client component fails the build. */
export function getSupabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY. Copy .env.example to .env.local and fill it in.");
  }
  return key;
}
