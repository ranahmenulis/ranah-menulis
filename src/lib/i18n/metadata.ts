import type { Dictionary } from "./dictionaries";
import { getDictionary } from "./server";

export const BRAND = "RanahMenulis";

type TitleKey = keyof Dictionary["titles"];

/**
 * Browser-tab title in the reader's language: page names joined by " · ", then the brand, e.g.
 * `pageTitle("streak", "studio")` → "Streak · Studio · RanahMenulis". Reads the locale cookie, so
 * call it from `generateMetadata` (the page already renders under the I18nRoot boundary).
 */
export async function pageTitle(...keys: TitleKey[]): Promise<string> {
  const { titles } = await getDictionary();
  return [...keys.map((key) => titles[key]), BRAND].join(" · ");
}

/**
 * Like `pageTitle`, with a leading part that is data (a project or event name), optionally
 * prefixed by a translated word: `projectTitle("Lomba X", "projects", "pay")` → "Pay: Lomba X · Projects · RanahMenulis".
 */
export async function titleWith(
  lead: string,
  keys: TitleKey[],
  prefix?: TitleKey,
): Promise<string> {
  const { titles } = await getDictionary();
  const head = prefix ? `${titles[prefix]}: ${lead}` : lead;
  return [head, ...keys.map((key) => titles[key]), BRAND].join(" · ");
}
