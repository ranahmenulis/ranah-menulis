"use client";

import Link from "next/link";
import { useFormat } from "@/lib/i18n/use-format";
import { format, useT } from "@/lib/i18n/provider";
import { useStreakData } from "../../hooks/use-streak-data";
import { studioStore } from "../../storage/store";

/** One quiet line linking Dokumen to Streak: today's progress and the streak (DESIGN.md 5.3). */
export function TodayLine() {
  const t = useT().studioDocuments.today;
  const f = useFormat();
  const { status, target, todayWords, summary } = useStreakData(studioStore);
  if (status !== "ready" || target === null) return null;
  const streak = format(summary.current === 1 ? t.dayOne : t.days, {
    count: String(summary.current),
  });
  const label = format(t.label, {
    words: String(todayWords),
    target: String(target),
    streak,
  });
  return (
    <Link
      href="/studio/streak"
      aria-label={label}
      className="group flex items-center gap-3 border-b border-line py-3.5 text-sm no-underline"
    >
      <span className="whitespace-nowrap tabular-nums">
        {t.prefix}{" "}
        <b className="font-medium group-hover:underline group-hover:underline-offset-3">
          {f.number(todayWords)} / {f.number(target)}
        </b>{" "}
        {t.suffix}
      </span>
      <span aria-hidden className="h-1 min-w-12 flex-[0_1_160px] bg-line">
        <i
          className="block h-full bg-ink"
          style={{ width: `${Math.min(100, (todayWords / target) * 100)}%` }}
        />
      </span>
      <span className="ml-auto whitespace-nowrap text-ink-muted">
        {format(t.streak, { streak })}
      </span>
    </Link>
  );
}
