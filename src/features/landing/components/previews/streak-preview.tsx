"use client";

import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { reached, useLoopTime } from "../../motion/use-loop";

// One subject per cycle: today's target is reached, then today's ring fills and the streak rises.
const RESET_MS = 150;
const REACHED_AT = 700;
const FILLED_AT = 1000;

// November 2026 starts on a Sunday; the calendar starts on Monday, so six blank cells first.
const calendar: ("blank" | "ring" | "empty" | "full")[] = [
  ...Array<"blank">(6).fill("blank"),
  "ring",
  "empty",
  ...Array<"full">(12).fill("full"),
  "blank",
];
const TODAY = 19;

// Value changes slide 300ms (DESIGN.md: the streak celebration); a reset jumps back at once.
const move = "transition-[transform,opacity] duration-300 ease-out";

function TodayDot({ filled, instant }: { filled: boolean; instant: boolean }) {
  return (
    <span className="relative grid size-3.5 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)]">
      <i
        className={cn(
          "absolute inset-0 rounded-full bg-ink",
          !instant && move,
          filled ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
    </span>
  );
}

function CalendarPreview({ filled, instant }: { filled: boolean; instant: boolean }) {
  const { weekdays } = useT().landing.previews;
  return (
    <div className="grid grid-cols-[repeat(7,36px)]">
      {weekdays.map((d, i) => (
        <span key={i} className="grid h-6 place-items-center text-xs text-ink-muted">
          {d}
        </span>
      ))}
      {calendar.map((kind, i) => (
        <span
          key={i}
          className={cn(
            "grid size-9 place-items-center",
            i === TODAY && "shadow-[inset_0_0_0_1px_var(--ink)]",
          )}
        >
          {i === TODAY && <TodayDot filled={filled} instant={instant} />}
          {i !== TODAY && kind === "full" && <i className="size-3.5 rounded-full bg-ink" />}
          {kind === "ring" && (
            <i className="size-3.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)]" />
          )}
          {kind === "empty" && (
            <i className="size-1 rounded-full bg-line-strong opacity-(--opacity-dot-empty)" />
          )}
        </span>
      ))}
    </div>
  );
}

/** The streak number rolls up: the old one leaves upward as the new one arrives from below. */
function StreakCount({ risen, instant }: { risen: boolean; instant: boolean }) {
  const roll = cn(!instant && move, "col-start-1 row-start-1");
  return (
    <span className="inline-grid overflow-hidden figure tabular-nums">
      <span className={cn(roll, risen ? "-translate-y-full opacity-0" : "translate-y-0")}>11</span>
      <span className={cn(roll, risen ? "translate-y-0" : "translate-y-full opacity-0")}>12</span>
    </span>
  );
}

export function StreakPreview() {
  const { previews } = useT().landing;
  const time = useLoopTime();
  const instant = time !== null && time < RESET_MS;
  const done = reached(time, REACHED_AT);
  const filled = reached(time, FILLED_AT);

  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-6 px-4 py-5 md:p-7">
      <div className="grid min-w-[200px] gap-5">
        <div className="flex items-baseline gap-2.5">
          <StreakCount risen={filled} instant={instant} />
          <span className="text-sm text-ink-muted">{previews.streakUnit}</span>
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between text-xs tabular-nums">
            <span>{format(previews.todayWords, { count: String(done ? 500 : 480) })}</span>
            <span
              className={cn(
                "text-ink-muted",
                !instant && "transition-opacity duration-300 ease-out",
                !filled && "opacity-0",
              )}
            >
              {previews.reached}
            </span>
          </div>
          <div className="h-1 bg-line">
            <i
              className={cn(
                "block h-full w-full origin-left bg-ink",
                !instant && "transition-transform duration-300 ease-out",
                done ? "scale-x-100" : "scale-x-96",
              )}
            />
          </div>
        </div>
      </div>
      <CalendarPreview filled={filled} instant={instant} />
    </div>
  );
}
