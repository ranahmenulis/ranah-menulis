"use client";

import type { Locale } from "@/lib/i18n/config";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/format";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { weekComparison, wordTotals } from "@/features/studio/word-totals";
import { home as homeId } from "./copy/id";

type WeekCopy = typeof homeId.week;

/**
 * One warm sentence about the last 7 days against the 7 before. No percentages and no praise
 * scale (DESIGN.md): a quiet week is met with an invitation, not a penalty. Null when there is
 * nothing to say. Copy and locale default to Indonesian so pure callers and tests stay simple.
 */
export function weekSentence(
  recent: number,
  before: number,
  copy: WeekCopy = homeId.week,
  locale: Locale = "id",
): string | null {
  if (recent === 0 && before === 0) return null;
  const words = (n: number) =>
    format(n === 1 ? copy.wordsOne : copy.words, { count: formatNumber(n, locale) });
  if (before === 0) return format(copy.first, { recent: words(recent) });
  if (recent === 0) return format(copy.none, { before: words(before) });
  if (recent === before) return format(copy.same, { recent: words(recent) });
  const gap = words(Math.abs(recent - before));
  return format(recent > before ? copy.more : copy.less, { recent: words(recent), gap });
}

/** The sentence for the Beranda greeting, or null while loading, on error, or with no writing. */
export function greetingSentence(
  data: StreakData,
  copy: WeekCopy = homeId.week,
  locale: Locale = "id",
): string | null {
  if (data.status !== "ready" || data.today === "") return null;
  const { recent, before } = weekComparison(data.words, data.today);
  return weekSentence(recent, before, copy, locale);
}

/**
 * Three word counts (this week, this month, this year; client decision 17 November 2026) for the
 * progress section of the side column. Calendar totals match Statistik. Not drawn while there is
 * nothing to count.
 */
export function WordTotals({ data }: { data: StreakData }) {
  const copy = useT().home.week;
  const locale = useLocale();
  if (greetingSentence(data, copy, locale) === null) return null;
  const totals = wordTotals(data.words, data.today);
  const items = [
    [copy.thisWeek, totals.week],
    [copy.thisMonth, totals.month],
    [copy.thisYear, totals.year],
  ] as const;

  return (
    <dl className="grid grid-cols-3 gap-x-4 border-t border-line pt-3">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-ink-muted">{label}</dt>
          <dd className="font-serif text-lg leading-6 font-semibold tabular-nums">
            {formatNumber(value, locale)}
            <span className="ml-1 font-sans text-xs font-normal text-ink-muted">{copy.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
