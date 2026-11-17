import { addDays, weekStart } from "./streak";

/**
 * Word totals for the Beranda summary (STK-05, client decision 17 November 2026): this week, this
 * month and this year, plus the last 7 days against the 7 before. Pure functions over the per-day
 * word map; "today" is passed in.
 *
 * Calendar totals match the Statistik screen (weeks start on Monday). The comparison uses rolling
 * 7-day windows instead, because a week that is only two days old would always lose to a full one.
 */

export type WordTotals = { week: number; month: number; year: number };

export function wordTotals(words: Map<string, number>, today: string): WordTotals {
  const week = weekStart(today);
  const month = today.slice(0, 8); // "YYYY-MM-"
  const year = today.slice(0, 5); // "YYYY-"
  const totals: WordTotals = { week: 0, month: 0, year: 0 };
  for (const [day, count] of words) {
    if (day > today) continue;
    if (day.startsWith(year)) totals.year += count;
    if (day.startsWith(month)) totals.month += count;
    if (day >= week) totals.week += count;
  }
  return totals;
}

export type WeekComparison = {
  /** Words in the 7 days ending today. */
  recent: number;
  /** Words in the 7 days before those. */
  before: number;
};

export function weekComparison(words: Map<string, number>, today: string): WeekComparison {
  let recent = 0;
  let before = 0;
  for (let i = 0; i < 7; i++) {
    recent += words.get(addDays(today, -i)) ?? 0;
    before += words.get(addDays(today, -7 - i)) ?? 0;
  }
  return { recent, before };
}
