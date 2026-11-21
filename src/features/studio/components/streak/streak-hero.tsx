"use client";

import type { CSSProperties } from "react";
import { Dot } from "@/components/ui/dots";
import { useCountUp } from "@/lib/use-count-up";
import type { StreakData } from "../../hooks/use-streak-data";
import { addDays, dayState, parseDay } from "../../streak";
import { formatRun, streakLine } from "../../streak-copy";
import { TodayRing } from "./today-ring";

const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "narrow" });
const shortDay = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

/** The last seven days as ink dots, today last; they drop in one after another. */
function WeekDots({ data }: { data: StreakData }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(data.today, i - 6));
  return (
    <ol aria-label="Tujuh hari terakhir" className="flex gap-3">
      {days.map((day, i) => {
        const state = dayState(day, data.today, data.words, data.changes);
        return (
          <li
            key={day}
            className="rm-pop grid justify-items-center gap-1.5"
            style={{ "--i": i * 5 + 10 } as CSSProperties}
          >
            <span className="grid size-5 place-items-center">
              {state === "met" && <Dot kind="full" size={16} />}
              {state === "partial" && <Dot kind="ring" size={16} />}
              {(state === "empty" || state === "future") && <Dot kind="empty" />}
            </span>
            <span className="text-[11px] text-ink-muted" aria-hidden>
              {weekday.format(parseDay(day))}
            </span>
            <span className="sr-only">
              {shortDay.format(parseDay(day))}:{" "}
              {state === "met" ? "target tercapai" : state === "partial" ? "ada tulisan" : "kosong"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The top of the Streak tab (DESIGN.md 6.7, 7.3): a dark band with the current streak as the one
 * huge number, the last seven days, and today's ring. The way to write sits under the band.
 */
export function StreakHero({ data, reachedToday }: { data: StreakData; reachedToday: boolean }) {
  const { summary, target, todayWords } = data;
  const streak = useCountUp(summary.current, 1100);
  return (
    <div className="theme-dark app-band mt-6 grid items-center gap-8 p-6 text-ink md:grid-cols-[minmax(0,1fr)_auto] md:p-10">
      <div className="grid min-w-0 content-start gap-4">
        <p className="text-sm font-medium text-ink-muted">Streak saat ini</p>
        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-serif text-[88px] leading-[0.85] font-light tabular-nums md:text-[132px]">
            {streak}
          </span>
          <span className="text-base text-ink-soft">hari berturut-turut</span>
        </p>
        <p className="text-sm text-ink-soft">
          {streakLine({ reachedToday, current: summary.current, last: summary.last })}
        </p>
        {summary.longest && (
          <p className="text-sm text-ink-muted">
            Terpanjang: {summary.longest.length} hari, {formatRun(summary.longest)}
          </p>
        )}
        <WeekDots data={data} />
      </div>
      {target !== null && <TodayRing words={todayWords} target={target} />}
    </div>
  );
}
