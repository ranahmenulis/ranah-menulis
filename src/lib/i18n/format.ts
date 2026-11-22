import type { Locale } from "./config";

/** BCP 47 tag used for number and date formatting in each interface language. */
const TAGS: Record<Locale, string> = { id: "id-ID", en: "en-US" };

export const intlTag = (locale: Locale): string => TAGS[locale];

export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(intlTag(locale));
}

const DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
const TIME: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };

/** "25 Nov 2026" (id) or "Nov 25, 2026" (en). Pass `timeZone` for a project's zone. */
export function formatDate(
  value: number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = DATE,
): string {
  return new Intl.DateTimeFormat(intlTag(locale), options).format(value);
}

/** Date and clock time, e.g. "25 Nov 2026, 14.30" (id) or "Nov 25, 2026, 14:30" (en). */
export function formatDateTime(
  value: number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return formatDate(value, locale, { ...DATE, ...TIME, ...options });
}
