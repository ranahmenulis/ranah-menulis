import { dayKey } from "./daily-progress";
import { addDays, parseDay, targetFor, weekStart, type TargetChange } from "./streak";

/**
 * Writing statistics (PRD STK-05): words per day, week and month, the average, the best day and
 * how often the target was met. Pure functions over the per-day word map; "today" is passed in.
 *
 * [usulan] The ranges are fixed (30 days, 12 weeks, 12 months) and weeks start on Monday, like the
 * calendar. Rules the PRD does not give are marked where they apply.
 */

export type Period = "day" | "week" | "month";

export const PERIOD_LENGTH: Record<Period, number> = { day: 30, week: 12, month: 12 };

export type Bucket = {
  /** First day of the bucket, "YYYY-MM-DD". */
  start: string;
  /** Last day, clipped to today for the bucket that is still running. */
  end: string;
  words: number;
  /** Day buckets only: the target in force that day, or null. */
  target: number | null;
  /** Days counted for the target comparison, and how many of them met it. */
  targetDays: number;
  metDays: number;
};

export type Summary = {
  total: number;
  /** Words per day over the counted days. */
  average: number;
  /** The day with the most words in the range; the earliest one on a tie. */
  best: { day: string; words: number } | null;
  targetDays: number;
  metDays: number;
};

export type Statistics = { buckets: Bucket[]; summary: Summary };

export function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

function monthBounds(today: string, ago: number): { start: string; end: string } {
  const now = parseDay(today);
  const year = now.getFullYear();
  const month = now.getMonth() - ago;
  return { start: dayKey(new Date(year, month, 1)), end: dayKey(new Date(year, month + 1, 0)) };
}

function bucketRanges(today: string, period: Period): { start: string; end: string }[] {
  const count = PERIOD_LENGTH[period];
  const ranges: { start: string; end: string }[] = [];
  for (let ago = count - 1; ago >= 0; ago--) {
    if (period === "day") {
      const day = addDays(today, -ago);
      ranges.push({ start: day, end: day });
    } else if (period === "week") {
      const start = addDays(weekStart(today), -7 * ago);
      ranges.push({ start, end: addDays(start, 6) });
    } else {
      ranges.push(monthBounds(today, ago));
    }
  }
  return ranges.map((r) => ({ start: r.start, end: r.end < today ? r.end : today }));
}

/** The earliest day with words, or null: the range does not start before the writer did. */
function firstWritingDay(words: Map<string, number>, today: string): string | null {
  let first: string | null = null;
  for (const [day, count] of words) {
    if (count > 0 && day <= today && (first === null || day < first)) first = day;
  }
  return first;
}

/**
 * [usulan] The running day (today) counts toward the target comparison only once it met the
 * target, like the streak (STK-04); days with no target in force, or before the first writing day,
 * are not counted.
 */
function countsForTarget(
  day: string,
  written: number,
  target: number,
  today: string,
  first: string | null,
): boolean {
  if (first === null || day < first) return false;
  return day !== today || written >= target;
}

export function statistics(
  words: Map<string, number>,
  changes: TargetChange[],
  today: string,
  period: Period,
): Statistics {
  const first = firstWritingDay(words, today);
  const ranges = bucketRanges(today, period);

  let best: Summary["best"] = null;
  let total = 0;
  let targetDays = 0;
  let metDays = 0;

  const buckets = ranges.map((range): Bucket => {
    const bucket: Bucket = {
      ...range,
      words: 0,
      target: period === "day" ? targetFor(changes, range.start) : null,
      targetDays: 0,
      metDays: 0,
    };
    for (const day of eachDay(range.start, range.end)) {
      const written = words.get(day) ?? 0;
      bucket.words += written;
      if (written > 0 && (best === null || written > best.words)) best = { day, words: written };
      const target = targetFor(changes, day);
      if (target !== null && countsForTarget(day, written, target, today, first)) {
        bucket.targetDays++;
        if (written >= target) bucket.metDays++;
      }
    }
    total += bucket.words;
    targetDays += bucket.targetDays;
    metDays += bucket.metDays;
    return bucket;
  });

  return {
    buckets,
    summary: {
      total,
      average: average(words, ranges, today, first, total),
      best,
      targetDays,
      metDays,
    },
  };
}

/**
 * [usulan] Words per day with empty days counted, from the first writing day on, so a new writer
 * is not diluted by weeks before they started. A running day with no words yet is not counted.
 */
function average(
  words: Map<string, number>,
  ranges: { start: string }[],
  today: string,
  first: string | null,
  total: number,
): number {
  if (first === null) return 0;
  const from = first > ranges[0].start ? first : ranges[0].start;
  let days = eachDay(from, today).length;
  if ((words.get(today) ?? 0) === 0) days--;
  return days > 0 ? Math.round(total / days) : 0;
}

/**
 * Y-axis ticks from 0 in a round step, at most four intervals, topping out at or above `max`.
 * Whole numbers only.
 */
export function axisTicks(max: number): number[] {
  if (max <= 0) return [0, 100];
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 1);
  const ticks: number[] = [];
  for (let value = 0; value < max + step; value += step) {
    ticks.push(value);
    if (value >= max) break;
  }
  return ticks;
}
