"use client";

import Link from "next/link";
import { heroArtClass, heroCardClass } from "@/components/ui/card";
import { WritingDesk } from "@/components/illustrations/studio-art";
import { useFormat } from "@/lib/i18n/use-format";
import { format, useT } from "@/lib/i18n/provider";
import { useStreakData } from "../../hooks/use-streak-data";
import { studioStore } from "../../storage/store";

/**
 * The top of the Dokumen tab (DESIGN.md 6.4, 7.10): a hero card over a writing desk with today's
 * words against the target and the streak; the whole card opens the Streak tab.
 */
export function TodayLine() {
  const t = useT().studioDocuments.today;
  const f = useFormat();
  const { status, target, todayWords, summary } = useStreakData(studioStore);
  if (status !== "ready") return null;
  const streak = format(summary.current === 1 ? t.dayOne : t.days, {
    count: String(summary.current),
  });
  const label =
    target === null
      ? `${t.noTarget} ${t.open}`
      : format(t.label, { words: String(todayWords), target: String(target), streak });
  return (
    <Link
      href="/studio/streak"
      aria-label={label}
      className={`${heroCardClass} group mt-5 grid min-h-40 content-start gap-3 no-underline md:min-h-44`}
    >
      <WritingDesk className={heroArtClass} />
      <span className="heading-sm text-ink">{t.title}</span>
      {target === null ? (
        <span className="max-w-[60%] text-sm text-ink-soft">{t.noTarget}</span>
      ) : (
        <>
          <span className="flex items-baseline gap-2 tabular-nums">
            <b className="text-[40px] leading-none font-bold tracking-tight md:text-5xl">
              {f.number(todayWords)}
            </b>
            <span className="text-sm text-ink-soft">
              / {f.number(target)} {t.suffix}
            </span>
          </span>
          <span aria-hidden className="block h-1.5 w-full max-w-60 rounded-full bg-line">
            <i
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, (todayWords / target) * 100)}%` }}
            />
          </span>
          <span className="text-sm text-ink-muted">{format(t.streak, { streak })}</span>
        </>
      )}
      <span className="w-fit text-sm font-medium text-accent-ink group-hover:underline group-hover:underline-offset-3">
        {t.open}
      </span>
    </Link>
  );
}
