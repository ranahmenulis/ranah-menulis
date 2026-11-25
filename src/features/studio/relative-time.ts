import type { Locale } from "@/lib/i18n/config";
import { formatClock } from "./count-words";

const MONTHS: Record<Locale, string[]> = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const WORDS = {
  id: { now: "baru saja", min: "menit lalu", hour: "jam lalu", today: "hari ini" },
  en: { now: "just now", min: "min ago", hour: "hr ago", today: "today" },
} as const;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

type Parts = { year: number; month: number; day: number };

/** Calendar parts of a moment in `timeZone`, or in the device's zone when none is given. */
function partsOf(ms: number, timeZone?: string): Parts {
  if (!timeZone) {
    const d = new Date(ms);
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }
  const found = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
      .formatToParts(ms)
      .map((p) => [p.type, Number(p.value)]),
  );
  return { year: found.year, month: found.month - 1, day: found.day };
}

/**
 * "Diubah" meta: "baru saja", "40 menit lalu", "2 jam lalu", "hari ini 08.40", "10 Nov". Pass
 * `timeZone` for fixed sample data (the landing page), so the server and the browser agree.
 */
export function formatChanged(
  timestamp: number,
  now: number,
  locale: Locale = "id",
  timeZone?: string,
): string {
  const w = WORDS[locale];
  const diff = now - timestamp;
  const date = partsOf(timestamp, timeZone);
  const today = partsOf(now, timeZone);
  const sameDay = date.year === today.year && date.month === today.month && date.day === today.day;
  const clock = formatClock(new Date(timestamp), "id", timeZone);

  if (diff < MINUTE) return w.now;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} ${w.min}`;
  if (diff < 6 * HOUR && sameDay) return `${Math.floor(diff / HOUR)} ${w.hour}`;
  if (sameDay) return `${w.today} ${locale === "en" ? clock.replace(".", ":") : clock}`;
  const month = MONTHS[locale][date.month];
  const label = locale === "en" ? `${month} ${date.day}` : `${date.day} ${month}`;
  if (date.year === today.year) return label;
  return locale === "en" ? `${label}, ${date.year}` : `${label} ${date.year}`;
}
