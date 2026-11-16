"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SIGN_IN_HREF, SIGN_UP_HREF, withNext } from "../redirect";

/**
 * Where "Masuk" and "Daftar" lead from the current screen: the account screens, remembering the
 * whole address (path and query, so a filtered catalogue or a chosen document comes back as it
 * was). Every screen that shows these buttons sits inside the app frame's Suspense boundary.
 */
export function useAuthLinks(): { signIn: string; signUp: string } {
  const pathname = usePathname();
  const query = useSearchParams()?.toString();
  const here = query ? `${pathname}?${query}` : pathname;
  return { signIn: withNext(SIGN_IN_HREF, here), signUp: withNext(SIGN_UP_HREF, here) };
}
