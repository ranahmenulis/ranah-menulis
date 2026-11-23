"use client";

import type { CSSProperties } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { useCountUp } from "@/lib/use-count-up";
import type { StreakData } from "../../hooks/use-streak-data";
import { addDays, dayState, parseDay } from "../../streak";
import { formatRun, shortDate, streakLine } from "../../streak-copy";
import { FlameMark, MountainScene } from "./streak-art";
import { TodayRing } from "./today-ring";

/** The last seven days as check circles, today last; they drop in one after another. */
function WeekDots({ data }: { data: StreakData }) {
  const t = useT().studioStreak.hero;
  const { locale, date } = useFormat();
  const days = Array.from({ length: 7 }, (_, i) => addDays(data.today, i - 6));
  return (
    <ol aria-label={t.lastSeven} className="flex gap-2.5 md:gap-4">
      {days.map((day, i) => {
        const state = dayState(day, data.today, data.words, data.changes);
        return (
          <li
            key={day}
            className="rm-pop grid justify-items-center gap-1.5"
            style={{ "--i": i * 5 + 10 } as CSSProperties}
          >
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full md:size-8",
                state === "met" && "bg-accent text-on-accent",
                state === "partial" && "border-2 border-accent-ink",
                (state === "empty" || state === "future") && "border-2 border-line",
              )}
            >
              {state === "met" && <Check size={16} weight="bold" aria-hidden />}
            </span>
            <span className="text-[11px] text-ink-muted" aria-hidden>
              {date(parseDay(day), { weekday: "short" }).replace(/\.$/, "")}
            </span>
            <span className="sr-only">
              {shortDate(parseDay(day), locale)}:{" "}
              {state === "met" ? t.met : state === "partial" ? t.partial : t.empty}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The top of the Streak tab (DESIGN.md 6.6, client reference 23 November 2026): a card over a night
 * ridge with the current streak as the one large number, the last seven days, and today's ring.
 */
export function StreakHero({ data, reachedToday }: { data: StreakData; reachedToday: boolean }) {
  const t = useT().studioStreak.hero;
  const { locale } = useFormat();
  const { summary, target, todayWords } = data;
  const streak = useCountUp(summary.current, 1100);
  return (
    <div className="relative isolate mt-6 overflow-hidden rounded-2xl border border-line bg-linear-to-br from-surface from-40% to-accent-subtle p-5 text-ink shadow-card md:p-8">
      <MountainScene className="absolute top-0 right-0 -z-10 h-[78%] w-[72%] [mask-image:linear-gradient(to_right,transparent,#000_45%),linear-gradient(to_bottom,#000_65%,transparent)] [mask-composite:intersect] md:right-56 md:h-full md:w-[52%] md:[mask-image:linear-gradient(to_right,transparent,#000_35%,#000_78%,transparent)] md:[mask-composite:add]" />
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid min-w-0 content-start gap-4">
          <p className="heading-sm text-ink">{t.current}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <FlameMark className="h-11 w-auto md:h-14" />
            <span className="text-[56px] leading-none font-bold tracking-tight tabular-nums md:text-[72px]">
              {streak}
            </span>
            <span className="text-base font-medium text-ink-soft">{t.daysInARow}</span>
          </p>
          <p className="text-sm text-ink-soft">
            {streakLine({ reachedToday, current: summary.current, last: summary.last }, locale)}
          </p>
          {summary.longest && (
            <p className="text-sm text-ink-muted">
              {format(t.longest, {
                length: String(summary.longest.length),
                range: formatRun(summary.longest, locale),
              })}
            </p>
          )}
          <WeekDots data={data} />
        </div>
        {target !== null && (
          // The mockup has no ring on phones; there the line under the card carries today's count.
          <div className="max-md:hidden">
            <TodayRing words={todayWords} target={target} />
          </div>
        )}
      </div>
    </div>
  );
}
