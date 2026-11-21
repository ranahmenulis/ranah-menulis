"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/use-count-up";

const number = new Intl.NumberFormat("id-ID");

/**
 * Today's words as a ring that closes toward the target, the number rolling up inside it. Used by
 * the Streak hero and, smaller, by the Beranda band.
 */
export function TodayRing({
  words,
  target,
  compact = false,
}: {
  words: number;
  target: number;
  compact?: boolean;
}) {
  const shown = useCountUp(words);
  const progress = Math.min(1, words / target);
  return (
    <div
      role="progressbar"
      aria-label="Progres hari ini"
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={words}
      className={cn(
        "relative grid shrink-0 place-items-center",
        compact ? "size-32 md:size-36" : "size-44 md:size-52",
      )}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" fill="none" aria-hidden>
        <circle cx={50} cy={50} r={45} stroke="var(--line)" strokeWidth={3} />
        <circle
          cx={50}
          cy={50}
          r={45}
          stroke="var(--ink)"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          className="rm-ring"
          style={{ "--to": 1 - progress } as CSSProperties}
        />
      </svg>
      <div className="grid justify-items-center gap-0.5 text-center">
        <span className="text-xs text-ink-muted">Hari ini</span>
        <span
          className={cn(
            "font-serif leading-none tabular-nums",
            compact ? "text-[30px] md:text-[34px]" : "text-[40px] md:text-[48px]",
          )}
        >
          {number.format(shown)}
        </span>
        <span className="text-xs text-ink-muted">/ {number.format(target)} kata</span>
      </div>
    </div>
  );
}
