import { parseDay } from "./streak";
import { capitalizeFirst } from "./streak-copy";
import { PERIOD_LENGTH, type Bucket, type Period } from "./statistics";

const number = new Intl.NumberFormat("id-ID");
const compact = new Intl.NumberFormat("id-ID", { notation: "compact" });
const fullDay = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDay = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const dayOnly = new Intl.DateTimeFormat("id-ID", { day: "numeric" });
const shortMonth = new Intl.DateTimeFormat("id-ID", { month: "short" });
const longMonth = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });

export const PERIOD_LABEL: Record<Period, string> = {
  day: "Harian",
  week: "Mingguan",
  month: "Bulanan",
};

const UNIT: Record<Period, string> = { day: "hari", week: "minggu", month: "bulan" };

/** "hari", "minggu" or "bulan". */
export const unitName = (period: Period): string => UNIT[period];

/** "30 hari terakhir", "12 minggu terakhir", "12 bulan terakhir". */
export function rangeName(period: Period): string {
  return `${PERIOD_LENGTH[period]} ${UNIT[period]} terakhir`;
}

/** The sentence for someone with nothing written yet; no threshold of days or words [konfirmasi]. */
export const NO_STATISTICS =
  "Belum cukup data untuk statistik. Tulis beberapa hari, lalu angkanya muncul di sini.";

/** Whole numbers under 10.000, compact above ("12 rb"), one style per axis. */
export function tickLabel(value: number, top: number): string {
  return top >= 10_000 ? compact.format(value) : number.format(value);
}

/** "3 Nov" for days and weeks (the week's first day), "Nov" for months. */
export function axisLabel(bucket: Bucket, period: Period): string {
  const start = parseDay(bucket.start);
  return period === "month" ? shortMonth.format(start) : shortDay.format(start);
}

/** "3–9 Nov", or "30 Okt – 5 Nov" across a month boundary. */
export function formatRange(start: string, end: string): string {
  const from = parseDay(start);
  const to = parseDay(end);
  if (start === end) return shortDay.format(from);
  if (from.getMonth() === to.getMonth()) {
    return `${dayOnly.format(from)}–${dayOnly.format(to)} ${shortMonth.format(to)}`;
  }
  return `${shortDay.format(from)} – ${shortDay.format(to)}`;
}

/** What a bucket is called: "Selasa, 3 November", "Minggu 3–9 Nov", "November 2026". */
export function bucketTitle(bucket: Bucket, period: Period): string {
  if (period === "day") return capitalizeFirst(fullDay.format(parseDay(bucket.start)));
  if (period === "week") return `Minggu ${formatRange(bucket.start, bucket.end)}`;
  return capitalizeFirst(longMonth.format(parseDay(bucket.start)));
}

/** The target part of a readout, or null when there is nothing to say. */
export function targetNote(bucket: Bucket, period: Period): string | null {
  if (period === "day") {
    if (bucket.target === null) return null;
    const target = number.format(bucket.target);
    return bucket.words >= bucket.target ? `memenuhi target ${target}` : `target ${target}`;
  }
  if (bucket.targetDays === 0) return null;
  return `${bucket.metDays} dari ${bucket.targetDays} hari memenuhi target`;
}

/** One line for the readout and for screen readers: "Selasa, 3 November · 320 kata · …". */
export function readout(bucket: Bucket, period: Period): string {
  const parts = [bucketTitle(bucket, period), `${number.format(bucket.words)} kata`];
  const note = targetNote(bucket, period);
  if (note) parts.push(note);
  return parts.join(" · ");
}

export function formatDay(day: string): string {
  return shortDay.format(parseDay(day));
}

export const formatNumber = (value: number): string => number.format(value);
