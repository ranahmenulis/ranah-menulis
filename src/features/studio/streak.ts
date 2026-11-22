import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";
import { fill } from "./copy/fill";
import { studioStreak as streakEn } from "./copy/streak-en";
import { studioStreak as streakId } from "./copy/streak-id";
import { dayKey, totalWords, type DailyLog } from "./daily-progress";

/** Calendar-day helpers on "YYYY-MM-DD" keys, using the device's local time zone. */
export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const date = parseDay(key);
  date.setDate(date.getDate() + n);
  return dayKey(date);
}

/** Words per day, from the per-day logs. */
export function wordsByDay(history: DailyLog[]): Map<string, number> {
  return new Map(history.map((log) => [log.day, totalWords(log)]));
}

/** A target that applies from a given day on. Changes take effect tomorrow (PRD STK-01). */
export type TargetChange = { from: string; value: number };

/** The target in force on `day`, or null when none had been set yet. */
export function targetFor(changes: TargetChange[], day: string): number | null {
  let value: number | null = null;
  for (const change of [...changes].sort((a, b) => a.from.localeCompare(b.from))) {
    if (change.from <= day) value = change.value;
  }
  return value;
}

type DayCheck = (day: string) => boolean;

function metChecker(words: Map<string, number>, changes: TargetChange[]): DayCheck {
  return (day) => {
    const target = targetFor(changes, day);
    return target !== null && (words.get(day) ?? 0) >= target;
  };
}

export type StreakRun = { length: number; start: string; end: string };

export type StreakSummary = {
  current: number;
  longest: StreakRun | null;
  /** The most recent run of met days, used to say what a broken streak used to be. */
  last: StreakRun | null;
};

/**
 * Streak = consecutive days that met their target (STK-04). Today does not break the streak
 * while it is still running: if today is not met yet, counting starts from yesterday.
 */
export function summarizeStreak(
  words: Map<string, number>,
  changes: TargetChange[],
  today: string,
): StreakSummary {
  const met = metChecker(words, changes);

  let current = 0;
  let cursor = met(today) ? today : addDays(today, -1);
  while (met(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  const runs = streakRuns(words, changes);
  let longest = null as StreakRun | null;
  for (const run of runs) if (!longest || run.length > longest.length) longest = run;
  return { current, longest, last: runs.at(-1) ?? null };
}

/** Every run of consecutive met days, oldest first. */
export function streakRuns(words: Map<string, number>, changes: TargetChange[]): StreakRun[] {
  const met = metChecker(words, changes);
  const runs: StreakRun[] = [];
  for (const day of [...words.keys()].filter(met).sort()) {
    const previous = runs.at(-1);
    if (previous && addDays(previous.end, 1) === day) {
      runs[runs.length - 1] = { length: previous.length + 1, start: previous.start, end: day };
    } else {
      runs.push({ length: 1, start: day, end: day });
    }
  }
  return runs;
}

/** A streak shorter than this is not kept in the history (usulan, mengikuti acuan Novlr). */
export const MIN_HISTORY_STREAK = 2;

export type PastStreak = StreakRun & { brokeOn: string; longest: boolean };

/**
 * Streaks that already ended, newest first (STK-09). The running streak is left out: it is the
 * run ending today, or yesterday while today is still open. Derived from the daily log, so
 * nothing is stored.
 */
export function pastStreaks(
  words: Map<string, number>,
  changes: TargetChange[],
  today: string,
): PastStreak[] {
  const summary = summarizeStreak(words, changes, today);
  const open = summary.current > 0 ? summary.last?.end : undefined;
  const past = streakRuns(words, changes).filter(
    (run) => run.end !== open && run.length >= MIN_HISTORY_STREAK,
  );
  return past
    .map((run) => ({
      ...run,
      brokeOn: addDays(run.end, 1),
      longest: run.start === summary.longest?.start,
    }))
    .reverse();
}

export type CalendarCell = { day: string; inMonth: boolean };

/** Six-week-or-fewer grid for a month, weeks starting Monday (usulan). */
export function monthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const count = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < offset; i++) cells.push({ day: "", inMonth: false });
  for (let d = 1; d <= count; d++)
    cells.push({ day: dayKey(new Date(year, month, d)), inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ day: "", inMonth: false });
  return cells;
}

export type DayState = "met" | "partial" | "empty" | "future";

export function dayState(
  day: string,
  today: string,
  words: Map<string, number>,
  changes: TargetChange[],
): DayState {
  if (day > today) return "future";
  const written = words.get(day) ?? 0;
  if (written === 0) return "empty";
  const target = targetFor(changes, day);
  return target !== null && written >= target ? "met" : "partial";
}

export type WeekStats = {
  total: number;
  average: number;
  best: { day: string; words: number } | null;
};

/** Monday of the week containing `day`. */
export function weekStart(day: string): string {
  const offset = (parseDay(day).getDay() + 6) % 7;
  return addDays(day, -offset);
}

/** This week up to and including today, and the best day of the month shown. */
export function weekStats(
  words: Map<string, number>,
  today: string,
  monthPrefix: string,
): WeekStats {
  const start = weekStart(today);
  let total = 0;
  let days = 0;
  for (let d = start; d <= today; d = addDays(d, 1)) {
    total += words.get(d) ?? 0;
    days++;
  }
  let best: WeekStats["best"] = null;
  for (const [day, w] of words) {
    if (day.startsWith(monthPrefix) && w > 0 && (!best || w > best.words)) best = { day, words: w };
  }
  return { total, average: days ? Math.round(total / days) : 0, best };
}

export type Milestone = {
  id: string;
  title: string;
  hint: string;
  achievedOn: string | null;
  remaining: string;
};

const WORD_MILESTONES = [10_000, 50_000];
const STREAK_MILESTONES = [7, 14, 30];

/** [konfirmasi] Q-10: the milestone list is a product decision; these are the board's examples. */
export function milestones(
  words: Map<string, number>,
  changes: TargetChange[],
  today: string,
  locale: Locale = "id",
): Milestone[] {
  const t = (locale === "en" ? streakEn : streakId).milestones;
  const number = (value: number) => formatNumber(value, locale);
  const days = [...words.keys()].sort();
  const lifetime = days.reduce((sum, d) => sum + (words.get(d) ?? 0), 0);

  // Longest run so far, and the day each streak length was first reached.
  const reached = new Map<number, string>();
  const met = metChecker(words, changes);
  let run = 0;
  let previous = "";
  for (const day of days.filter(met)) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    previous = day;
    for (const n of STREAK_MILESTONES) if (run >= n && !reached.has(n)) reached.set(n, day);
  }
  const { current } = summarizeStreak(words, changes, today);

  const streakItems = STREAK_MILESTONES.map((n) => ({
    id: `streak-${n}`,
    title: fill(t.streakTitle, { n: String(n) }),
    hint: t.streakHint,
    achievedOn: reached.get(n) ?? null,
    remaining: fill(t.streakRemaining, { n: String(Math.max(0, n - current)) }),
  }));

  let cumulative = 0;
  const reachedWords = new Map<number, string>();
  for (const day of days) {
    cumulative += words.get(day) ?? 0;
    for (const n of WORD_MILESTONES)
      if (cumulative >= n && !reachedWords.has(n)) reachedWords.set(n, day);
  }
  const wordItems = WORD_MILESTONES.map((n) => ({
    id: `words-${n}`,
    title: fill(t.wordsTitle, { n: number(n) }),
    hint: t.wordsHint,
    achievedOn: reachedWords.get(n) ?? null,
    remaining: fill(t.wordsRemaining, { n: number(Math.max(0, n - lifetime)) }),
  }));

  return [...streakItems, ...wordItems];
}
