import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Klien service role: MELEWATI RLS. Hanya untuk kode server tepercaya
 * (penyiapan Super Admin, webhook pembayaran). Jangan diimpor dari komponen klien.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
