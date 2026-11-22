import type { Locale } from "@/lib/i18n/config";
import { formatClock } from "@/features/studio/count-words";

const MONTHS: Record<Locale, string[]> = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const WORDS = {
  id: {
    now: "baru saja",
    min: "menit",
    hour: "jam",
    yesterday: "kemarin",
    days: "hari",
    at: "pukul",
  },
  en: { now: "just now", min: "min", hour: "hr", yesterday: "yesterday", days: "days", at: "at" },
} as const;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "12 Nov" (id) or "Nov 12" (en), with the year when it is not the current one. */
export function formatDay(timestamp: number, now: number, locale: Locale = "id"): string {
  const date = new Date(timestamp);
  const month = MONTHS[locale][date.getMonth()];
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  if (locale === "en") {
    return sameYear
      ? `${month} ${date.getDate()}`
      : `${month} ${date.getDate()}, ${date.getFullYear()}`;
  }
  const label = `${date.getDate()} ${month}`;
  return sameYear ? label : `${label} ${date.getFullYear()}`;
}

/**
 * Feed and comment time: "baru saja", "40 menit", "2 jam", "kemarin", "3 hari", then "12 Nov"
 * (en: "just now", "40 min", "2 hr", "yesterday", "3 days", then "Nov 12").
 */
export function formatAgo(timestamp: number, now: number, locale: Locale = "id"): string {
  const w = WORDS[locale];
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) return w.now;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} ${w.min}`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} ${w.hour}`;

  const days = Math.floor(diff / DAY);
  if (days === 1) return w.yesterday;
  if (days < 7) return `${days} ${w.days}`;
  return formatDay(timestamp, now, locale);
}

/** Absolute time in the reader's zone for the post meta line: "13 Nov pukul 03.37" / "Nov 13 at 03:37". */
export function formatAbsolute(timestamp: number, now: number, locale: Locale = "id"): string {
  const clock = formatClock(new Date(timestamp));
  return `${formatDay(timestamp, now, locale)} ${WORDS[locale].at} ${
    locale === "en" ? clock.replace(".", ":") : clock
  }`;
}
