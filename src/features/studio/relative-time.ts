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

/** "Diubah" meta: "baru saja", "40 menit lalu", "2 jam lalu", "hari ini 08.40", "10 Nov". */
export function formatChanged(timestamp: number, now: number, locale: Locale = "id"): string {
  const w = WORDS[locale];
  const diff = now - timestamp;
  const date = new Date(timestamp);
  const today = new Date(now);
  const sameDay = date.toDateString() === today.toDateString();
  const clock = formatClock(date);

  if (diff < MINUTE) return w.now;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} ${w.min}`;
  if (diff < 6 * HOUR && sameDay) return `${Math.floor(diff / HOUR)} ${w.hour}`;
  if (sameDay) return `${w.today} ${locale === "en" ? clock.replace(".", ":") : clock}`;
  const month = MONTHS[locale][date.getMonth()];
  const label = locale === "en" ? `${month} ${date.getDate()}` : `${date.getDate()} ${month}`;
  if (date.getFullYear() === today.getFullYear()) return label;
  return locale === "en" ? `${label}, ${date.getFullYear()}` : `${label} ${date.getFullYear()}`;
}
