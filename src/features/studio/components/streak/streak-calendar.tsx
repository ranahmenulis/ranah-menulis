"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useState, type CSSProperties } from "react";
import { Dot } from "@/components/ui/dots";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import type { DailyLog } from "../../daily-progress";
import { dayState, monthGrid, parseDay, type TargetChange } from "../../streak";
import { capitalizeFirst, shortDate } from "../../streak-copy";

const MONTH_YEAR: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
const LONG_DAY: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "short" };

type CalendarProps = {
  today: string;
  words: Map<string, number>;
  history: DailyLog[];
  changes: TargetChange[];
  /** Fill the ring of today once; set only in the session where the target was just reached. */
  celebrate: boolean;
};

type CalendarCopy = ReturnType<typeof useT>["studioStreak"]["calendar"];

function ariaFor(
  day: string,
  today: string,
  state: string,
  written: number,
  t: CalendarCopy,
  locale: Locale,
) {
  const label = shortDate(parseDay(day), locale);
  const extra = day === today ? t.todaySuffix : "";
  if (state === "future") return label;
  if (state === "empty") return `${label}${extra}${t.emptySuffix}`;
  const words = format(t.wordsSuffix, { words: formatNumber(written, locale) });
  return `${label}${extra}${words}${state === "met" ? t.metSuffix : ""}`;
}

/**
 * Month of ink dots (DESIGN.md 7.3): weeks start Monday, 36px cells on desktop, full-width 48px
 * cells on phones so each day can be tapped. Picking a day shows words per document (STK-03).
 */
export function StreakCalendar({ today, words, history, changes, celebrate }: CalendarProps) {
  const root = useT().studioStreak;
  const t = root.calendar;
  const untitled = root.untitled;
  const { locale, number, date } = useFormat();
  const now = parseDay(today);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [picked, setPicked] = useState(today);

  const cells = monthGrid(cursor.year, cursor.month);
  const isCurrent = cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  const prefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`;
  const monthName = date(new Date(cursor.year, cursor.month, 1), MONTH_YEAR);
  const monthEmpty = ![...words].some(([d, w]) => d.startsWith(prefix) && w > 0);

  const step = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const pickedWords = words.get(picked) ?? 0;
  const pickedLog = history.find((l) => l.day === picked);
  const pickedState = dayState(picked, today, words, changes);
  const docs = pickedLog
    ? Object.entries(pickedLog.docs)
        .map(([id, d]) => ({ id, ...d }))
        .filter((d) => d.words > 0)
        .sort((a, b) => b.words - a.words)
    : [];

  return (
    <section aria-labelledby="cal-heading" className="grid content-start gap-4">
      <div className="flex items-center gap-1">
        <h2 id="cal-heading" className="mr-auto heading-md capitalize">
          {monthName}
        </h2>
        <IconButton label={t.previous} onClick={() => step(-1)}>
          <CaretLeft size={20} aria-hidden />
        </IconButton>
        <IconButton label={t.next} disabled={isCurrent} onClick={() => step(1)}>
          <CaretRight size={20} aria-hidden />
        </IconButton>
      </div>

      <div
        role="grid"
        aria-label={format(t.gridLabel, { month: monthName })}
        key={prefix}
        className="grid grid-cols-7 md:grid-cols-[repeat(7,52px)]"
      >
        {t.weekdays.map((w, i) => (
          <span key={i} className="grid h-10 place-items-center text-xs text-ink-muted">
            {w}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell.inMonth) return <span key={i} className="h-12 md:h-13" />;
          const state = dayState(cell.day, today, words, changes);
          const isToday = cell.day === today;
          const written = words.get(cell.day) ?? 0;
          return (
            <button
              key={cell.day}
              type="button"
              disabled={state === "future"}
              aria-label={ariaFor(cell.day, today, state, written, t, locale)}
              aria-pressed={picked === cell.day}
              aria-current={isToday ? "date" : undefined}
              onClick={() => setPicked(cell.day)}
              className={cn(
                "grid h-12 cursor-pointer place-items-center transition-colors duration-150 hover:bg-subtle disabled:cursor-default disabled:hover:bg-transparent md:h-13",
                isToday && "shadow-[inset_0_0_0_1px_var(--ink)]",
                picked === cell.day && !isToday && "bg-subtle",
              )}
            >
              <span
                className="rm-pop grid place-items-center"
                style={{ "--i": i } as CSSProperties}
              >
                {state === "met" && <Dot kind={isToday && celebrate ? "fill" : "full"} size={20} />}
                {state === "partial" && <Dot kind="ring" size={20} />}
                {state === "empty" && <Dot kind="empty" />}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-hidden className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
        <span className="flex items-center gap-2">
          <Dot kind="full" />
          {t.legendMet}
        </span>
        <span className="flex items-center gap-2">
          <Dot kind="ring" />
          {t.legendPartial}
        </span>
        <span className="flex items-center gap-2">
          <Dot kind="empty" />
          {t.legendEmpty}
        </span>
      </div>

      {monthEmpty && (
        <div>
          <p className="font-serif text-xl leading-7 font-semibold">{t.monthEmptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{t.monthEmptyHint}</p>
        </div>
      )}

      {picked <= today && (
        <div role="status" className="grid gap-3 border-t border-line pt-4 text-sm">
          <p>
            <b className="font-medium">
              {picked === today && t.pickedToday}
              {capitalizeFirst(date(parseDay(picked), LONG_DAY), locale)}
            </b>{" "}
            ·{" "}
            {pickedWords === 0
              ? t.noWriting
              : format(pickedState === "met" ? t.pickedWordsMet : t.pickedWords, {
                  words: number(pickedWords),
                })}
          </p>
          {docs.length > 0 && (
            <>
              <ul
                aria-label={t.docsLabel}
                className="grid grid-cols-[minmax(0,1fr)] border-t border-line"
              >
                {docs.map((d) => (
                  <li key={d.id} className="flex items-baseline gap-3 border-b border-line py-2.5">
                    <span className="min-w-0 flex-1 truncate">{d.title || untitled}</span>
                    <span className="text-ink-muted tabular-nums">{number(d.words)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-muted">{t.docsNote}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
