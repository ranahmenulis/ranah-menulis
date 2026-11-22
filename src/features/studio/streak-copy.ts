import type { Locale } from "@/lib/i18n/config";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { fill } from "./copy/fill";
import { studioStreak as streakEn } from "./copy/streak-en";
import { studioStreak as streakId } from "./copy/streak-id";
import { parseDay, type StreakRun } from "./streak";

const COPY = { id: streakId, en: streakEn };

/** The Streak dictionary slice for a language, for pure code that cannot use hooks. */
export const streakCopy = (locale: Locale) => COPY[locale];

const DAY_MONTH: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

/** "8 Nov" (id) or "Nov 8" (en). */
export const shortDate = (date: Date, locale: Locale): string =>
  formatDate(date, locale, DAY_MONTH);

export function formatRun(run: StreakRun, locale: Locale = "id"): string {
  const start = parseDay(run.start);
  const end = parseDay(run.end);
  if (run.start === run.end) return shortDate(start, locale);
  // Same month reads "8–12 Nov" (en: "Nov 8–12"); different months keep both: "28 Okt–2 Nov".
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (!sameMonth) return `${shortDate(start, locale)}–${shortDate(end, locale)}`;
  if (locale === "en") {
    const month = formatDate(start, locale, { month: "short" });
    return `${month} ${start.getDate()}–${end.getDate()}`;
  }
  return `${start.getDate()}–${shortDate(end, locale)}`;
}

type TodayInput = { target: number; todayWords: number; current: number; broken: boolean };

/** One honest sentence about today. No exclamation marks, no "failed" (DESIGN.md 12, canvas notes). */
export function todayLine(
  { target, todayWords, current, broken }: TodayInput,
  locale: Locale = "id",
): string {
  const t = streakCopy(locale).line;
  if (todayWords >= target) return fill(t.reached, { current: String(current) });
  const left = formatNumber(target - todayWords, locale);
  return fill(broken && current === 0 ? t.remainingNew : t.remaining, { left });
}

/** Second line of the streak block: whether today is counted yet, or what a broken streak was. */
export function streakLine(
  {
    reachedToday,
    current,
    last,
  }: {
    reachedToday: boolean;
    current: number;
    last: StreakRun | null;
  },
  locale: Locale = "id",
): string {
  const t = streakCopy(locale).line;
  if (current === 0 && last) {
    return fill(t.previous, {
      length: String(last.length),
      range: formatRun(last, locale),
    });
  }
  return reachedToday ? t.counted : t.notCounted;
}

/** Intl returns weekdays in lowercase for Indonesian; sentences start with a capital. */
export function capitalizeFirst(text: string, locale: Locale = "id"): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
