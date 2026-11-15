export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "locale";
/** One year, in seconds. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the locale: a valid cookie wins, then the first supported language in Accept-Language
 * (highest q first, region ignored), then the default.
 */
export function resolveLocale(
  cookieValue: string | undefined | null,
  acceptLanguage: string | undefined | null,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        weight: Number.isNaN(weight) ? 0 : weight,
      };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
