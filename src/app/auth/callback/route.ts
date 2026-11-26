import { NextResponse, type NextRequest } from "next/server";
import { internalPath, ONBOARDING_HREF, withNext } from "@/features/account/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * The page an email link or OAuth flow opens. It swaps the one-time code for a session, then
 * sends the reader on to `next` (or to `/mulai` when `onboarding=1` and the profile is not yet
 * finished). An expired link, one opened in another browser, or a missing code goes to `fail`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = internalPath(searchParams.get("next"), "/beranda");
  const fail = internalPath(searchParams.get("fail"), "/masuk");
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}${fail}`);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}${fail}`);
    if (searchParams.get("onboarding") === "1" && data.user?.id) {
      const profile = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!profile.data?.onboarded_at) {
        const dest = withNext(ONBOARDING_HREF, next === "/beranda" ? null : next);
        return NextResponse.redirect(`${origin}${dest}`);
      }
    }
    return NextResponse.redirect(`${origin}${next}`);
  } catch {
    return NextResponse.redirect(`${origin}${fail}`);
  }
}
