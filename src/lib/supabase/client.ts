import { createBrowserClient } from "@supabase/ssr";

/** Klien browser. Hanya untuk auth dan operasi yang aman; akses data sensitif lewat server (PRD 19.3). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
