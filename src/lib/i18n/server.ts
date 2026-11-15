import { cache } from "react";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Locale of the current request. Reads runtime data, so call it under a Suspense boundary. */
export const getLocale = cache(async (): Promise<Locale> => {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  return resolveLocale(store.get(LOCALE_COOKIE)?.value, requestHeaders.get("accept-language"));
});

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
