import { NextResponse, type NextRequest } from "next/server";
import { internalPath } from "@/features/account/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * The page an email link (verify the address, reset the password) opens. It swaps the one-time
 * code for a session, then sends the reader on to `next`. An expired link, one opened in another
 * browser than the one that asked for it, or a missing code goes to `fail` instead.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = internalPath(searchParams.get("next"), "/beranda");
  const fail = internalPath(searchParams.get("fail"), "/masuk");
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}${fail}`);
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(`${origin}${error ? fail : next}`);
  } catch {
    return NextResponse.redirect(`${origin}${fail}`);
  }
}
