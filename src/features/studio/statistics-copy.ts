import type { Locale } from "@/lib/i18n/config";
import { formatDate, intlTag, formatNumber as formatLocaleNumber } from "@/lib/i18n/format";
import { fill } from "./copy/fill";
import { studioStats as statsEn } from "./copy/stats-en";
import { studioStats as statsId } from "./copy/stats-id";
import { parseDay } from "./streak";
import { capitalizeFirst, shortDate } from "./streak-copy";
import { PERIOD_LENGTH, type Bucket, type Period } from "./statistics";

const COPY = { id: statsId, en: statsEn };

/** The Statistik dictionary slice for a language, for pure code that cannot use hooks. */
export const statsCopy = (locale: Locale) => COPY[locale];

export const PERIOD_LABEL: Record<Period, string> = statsId.period;

/** "Harian", "Mingguan" or "Bulanan" (en: "Daily", "Weekly", "Monthly"). */
export const periodLabel = (period: Period, locale: Locale = "id"): string =>
  COPY[locale].period[period];

/** "hari", "minggu" or "bulan" (en: "day", "week", "month"). */
export const unitName = (period: Period, locale: Locale = "id"): string =>
  COPY[locale].unit[period];

/** "30 hari terakhir", "12 minggu terakhir", "12 bulan terakhir" (en: "last 30 days", ...). */
export function rangeName(period: Period, locale: Locale = "id"): string {
  return fill(COPY[locale].range[period], { n: String(PERIOD_LENGTH[period]) });
}

/** The sentence for someone with nothing written yet; no threshold of days or words [konfirmasi]. */
export const NO_STATISTICS = statsId.noData;

export const noStatistics = (locale: Locale = "id"): string => COPY[locale].noData;

/** Whole numbers under 10.000, compact above ("12 rb"), one style per axis. */
export function tickLabel(value: number, top: number, locale: Locale = "id"): string {
  return top >= 10_000
    ? new Intl.NumberFormat(intlTag(locale), { notation: "compact" }).format(value)
    : formatLocaleNumber(value, locale);
}

/** "3 Nov" for days and weeks (the week's first day), "Nov" for months. */
export function axisLabel(bucket: Bucket, period: Period, locale: Locale = "id"): string {
  const start = parseDay(bucket.start);
  return period === "month"
    ? formatDate(start, locale, { month: "short" })
    : shortDate(start, locale);
}

/** "3–9 Nov" (en: "Nov 3–9"), or "30 Okt – 5 Nov" across a month boundary. */
export function formatRange(start: string, end: string, locale: Locale = "id"): string {
  const from = parseDay(start);
  const to = parseDay(end);
  if (start === end) return shortDate(from, locale);
  if (from.getMonth() === to.getMonth()) {
    const month = formatDate(to, locale, { month: "short" });
    return locale === "en"
      ? `${month} ${from.getDate()}–${to.getDate()}`
      : `${from.getDate()}–${to.getDate()} ${month}`;
  }
  return `${shortDate(from, locale)} – ${shortDate(to, locale)}`;
}

/** What a bucket is called: "Selasa, 3 November", "Minggu 3–9 Nov", "November 2026". */
export function bucketTitle(bucket: Bucket, period: Period, locale: Locale = "id"): string {
  const start = parseDay(bucket.start);
  if (period === "day") {
    const full = formatDate(start, locale, { weekday: "long", day: "numeric", month: "long" });
    return capitalizeFirst(full, locale);
  }
  if (period === "week") {
    return fill(COPY[locale].readout.weekTitle, {
      range: formatRange(bucket.start, bucket.end, locale),
    });
  }
  return capitalizeFirst(formatDate(start, locale, { month: "long", year: "numeric" }), locale);
}

/** The target part of a readout, or null when there is nothing to say. */
export function targetNote(bucket: Bucket, period: Period, locale: Locale = "id"): string | null {
  const t = COPY[locale].readout;
  if (period === "day") {
    if (bucket.target === null) return null;
    const target = formatLocaleNumber(bucket.target, locale);
    return fill(bucket.words >= bucket.target ? t.targetMet : t.target, { target });
  }
  if (bucket.targetDays === 0) return null;
  return fill(t.daysMet, { met: String(bucket.metDays), total: String(bucket.targetDays) });
}

/** One line for the readout and for screen readers: "Selasa, 3 November · 320 kata · …". */
export function readout(bucket: Bucket, period: Period, locale: Locale = "id"): string {
  const parts = [
    bucketTitle(bucket, period, locale),
    fill(COPY[locale].readout.words, { words: formatLocaleNumber(bucket.words, locale) }),
  ];
  const note = targetNote(bucket, period, locale);
  if (note) parts.push(note);
  return parts.join(" · ");
}

export function formatDay(day: string, locale: Locale = "id"): string {
  return shortDate(parseDay(day), locale);
}

export const formatNumber = (value: number, locale: Locale = "id"): string =>
  formatLocaleNumber(value, locale);
