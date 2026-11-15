"use client";

import Link from "next/link";
import { useStreakData } from "../../hooks/use-streak-data";
import { studioStore } from "../../storage/store";

const number = new Intl.NumberFormat("id-ID");

/** One quiet line linking Dokumen to Streak: today's progress and the streak (DESIGN.md 5.3). */
export function TodayLine() {
  const { status, target, todayWords, summary } = useStreakData(studioStore);
  if (status !== "ready" || target === null) return null;
  const label = `Hari ini ${todayWords} dari ${target} kata, streak ${summary.current} hari. Buka tab Streak`;
  return (
    <Link
      href="/studio/streak"
      aria-label={label}
      className="group flex items-center gap-3 border-b border-line py-3.5 text-sm no-underline"
    >
      <span className="whitespace-nowrap tabular-nums">
        Hari ini{" "}
        <b className="font-medium group-hover:underline group-hover:underline-offset-3">
          {number.format(todayWords)} / {number.format(target)}
        </b>{" "}
        kata
      </span>
      <span aria-hidden className="h-1 min-w-12 flex-[0_1_160px] bg-line">
        <i
          className="block h-full bg-ink"
          style={{ width: `${Math.min(100, (todayWords / target) * 100)}%` }}
        />
      </span>
      <span className="ml-auto whitespace-nowrap text-ink-muted">
        Streak {summary.current} hari
      </span>
    </Link>
  );
}
