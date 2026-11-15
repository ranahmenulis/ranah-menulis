"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Dot } from "@/components/ui/dots";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { DailyLog } from "../../daily-progress";
import { dayState, monthGrid, parseDay, type TargetChange } from "../../streak";
import { capitalizeFirst } from "../../streak-copy";

const WEEKDAYS = ["S", "S", "R", "K", "J", "S", "M"];
const number = new Intl.NumberFormat("id-ID");
const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
const longDay = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

type CalendarProps = {
  today: string;
  words: Map<string, number>;
  history: DailyLog[];
  changes: TargetChange[];
  /** Fill the ring of today once; set only in the session where the target was just reached. */
  celebrate: boolean;
};

function ariaFor(day: string, today: string, state: string, written: number) {
  const date = parseDay(day);
  const label = `${date.getDate()} ${new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date)}`;
  const extra = day === today ? ", hari ini" : "";
  if (state === "future") return label;
  if (state === "empty") return `${label}${extra}, kosong`;
  return `${label}${extra}, ${number.format(written)} kata${state === "met" ? ", target tercapai" : ""}`;
}

/**
 * Month of ink dots (DESIGN.md 7.3): weeks start Monday, 36px cells on desktop, full-width 48px
 * cells on phones so each day can be tapped. Picking a day shows words per document (STK-03).
 */
export function StreakCalendar({ today, words, history, changes, celebrate }: CalendarProps) {
  const now = parseDay(today);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [picked, setPicked] = useState(today);

  const cells = monthGrid(cursor.year, cursor.month);
  const isCurrent = cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  const prefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`;
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
          {monthName.format(new Date(cursor.year, cursor.month, 1))}
        </h2>
        <IconButton label="Bulan sebelumnya" onClick={() => step(-1)}>
          <CaretLeft size={20} aria-hidden />
        </IconButton>
        <IconButton label="Bulan berikutnya" disabled={isCurrent} onClick={() => step(1)}>
          <CaretRight size={20} aria-hidden />
        </IconButton>
      </div>

      <div
        role="grid"
        aria-label={`Kalender ${monthName.format(new Date(cursor.year, cursor.month, 1))}, minggu mulai Senin`}
        className="grid grid-cols-7 md:grid-cols-[repeat(7,36px)]"
      >
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="grid h-9 place-items-center text-xs text-ink-muted">
            {w}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell.inMonth) return <span key={i} className="h-9 max-md:h-12" />;
          const state = dayState(cell.day, today, words, changes);
          const isToday = cell.day === today;
          const written = words.get(cell.day) ?? 0;
          return (
            <button
              key={cell.day}
              type="button"
              disabled={state === "future"}
              aria-label={ariaFor(cell.day, today, state, written)}
              aria-pressed={picked === cell.day}
              aria-current={isToday ? "date" : undefined}
              onClick={() => setPicked(cell.day)}
              className={cn(
                "grid h-9 cursor-pointer place-items-center disabled:cursor-default max-md:h-12",
                isToday && "shadow-[inset_0_0_0_1px_var(--ink)]",
                picked === cell.day && !isToday && "bg-subtle",
              )}
            >
              {state === "met" && <Dot kind={isToday && celebrate ? "fill" : "full"} />}
              {state === "partial" && <Dot kind="ring" />}
              {state === "empty" && <Dot kind="empty" />}
            </button>
          );
        })}
      </div>

      <div aria-hidden className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
        <span className="flex items-center gap-2">
          <Dot kind="full" />
          Target tercapai
        </span>
        <span className="flex items-center gap-2">
          <Dot kind="ring" />
          Ada tulisan
        </span>
        <span className="flex items-center gap-2">
          <Dot kind="empty" />
          Kosong
        </span>
      </div>

      {monthEmpty && (
        <div>
          <p className="font-serif text-xl leading-7 font-semibold">Belum ada tulisan bulan ini.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Satu kalimat di Studio sudah cukup untuk titik pertama.
          </p>
        </div>
      )}

      {picked <= today && (
        <div role="status" className="grid gap-3 border-t border-line pt-4 text-sm">
          <p>
            <b className="font-medium">
              {picked === today && "Hari ini, "}
              {capitalizeFirst(longDay.format(parseDay(picked)))}
            </b>{" "}
            ·{" "}
            {pickedWords === 0
              ? "Tidak ada tulisan."
              : `${number.format(pickedWords)} kata${pickedState === "met" ? ", target tercapai." : "."}`}
          </p>
          {docs.length > 0 && (
            <>
              <ul
                aria-label="Kata per dokumen"
                className="grid grid-cols-[minmax(0,1fr)] border-t border-line"
              >
                {docs.map((d) => (
                  <li key={d.id} className="flex items-baseline gap-3 border-b border-line py-2.5">
                    <span className="min-w-0 flex-1 truncate">{d.title || "Tanpa judul"}</span>
                    <span className="text-ink-muted tabular-nums">{number.format(d.words)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-muted">
                Kata bersih yang ditulis hari itu, dari catatan simpan otomatis Studio. Dokumen yang
                kemudian dihapus tetap dihitung.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
