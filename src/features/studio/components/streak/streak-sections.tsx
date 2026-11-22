"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import type { StreakData } from "../../hooks/use-streak-data";
import { parseDay, weekStats } from "../../streak";
import { noStatistics } from "../../statistics-copy";
import { shortDate, todayLine } from "../../streak-copy";
import { StreakHero } from "./streak-hero";

/** Today's progress and the current streak, or the "set a target" invitation. */
export function TodaySection({
  data,
  startHref,
  reachedToday,
  onSetTarget,
}: {
  data: StreakData;
  startHref: string;
  reachedToday: boolean;
  onSetTarget: () => void;
}) {
  const t = useT().studioStreak;
  const { locale } = useFormat();
  const { target, todayWords, summary, lastDocument } = data;
  if (target === null) {
    return (
      <section aria-label={t.today.label} className="mt-6 grid gap-6">
        <div className="theme-dark app-band grid content-start justify-items-start gap-3 p-6 text-ink md:p-10">
          <p className="font-serif text-[28px] leading-9 font-semibold md:text-[36px] md:leading-[44px]">
            {t.today.noTargetTitle}
          </p>
          <p className="max-w-110 text-sm text-ink-soft">{t.today.noTargetBody}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSetTarget}>{t.today.setTarget}</Button>
          <ButtonLink href={startHref} variant="text">
            {t.today.writeFirst}
          </ButtonLink>
        </div>
      </section>
    );
  }
  return (
    <section aria-label={t.today.label} className="grid gap-5">
      <StreakHero data={data} reachedToday={reachedToday} />
      <div className="grid justify-items-start gap-3">
        <p className="text-base">
          {todayLine(
            {
              target,
              todayWords,
              current: summary.current,
              broken: summary.current === 0 && summary.last !== null,
            },
            locale,
          )}
        </p>
        <ButtonLink href={startHref}>{t.today.start}</ButtonLink>
        {lastDocument && (
          <p className="text-xs text-ink-muted">
            {format(t.today.lastDocument, { title: lastDocument.title || t.untitled })}
          </p>
        )}
      </div>
    </section>
  );
}

/** Three plain numbers under the calendar (usulan); no chart here. */
export function StatsSection({
  words,
  today,
  hasWriting,
}: {
  words: Map<string, number>;
  today: string;
  hasWriting: boolean;
}) {
  const t = useT().studioStreak.stats;
  const { locale } = useFormat();
  const stats = weekStats(words, today, today.slice(0, 7));
  return (
    <section aria-label={t.label}>
      {hasWriting ? (
        <div className="border-t border-line pt-4">
          <dl className="grid grid-cols-3">
            <Stat value={stats.total} label={t.weekWords} />
            <Stat value={stats.average} label={t.weekAverage} />
            <Stat
              value={stats.best ? stats.best.words : 0}
              label={
                stats.best
                  ? format(t.bestOfMonthOn, {
                      day: shortDate(parseDay(stats.best.day), locale),
                    })
                  : t.bestOfMonth
              }
            />
          </dl>
          <ButtonLink href="/studio/statistik" variant="text" className="mt-3 -ml-3 text-ink">
            {t.seeAll}
          </ButtonLink>
        </div>
      ) : (
        <p className="border-t border-line pt-4 text-sm text-ink-muted">{noStatistics(locale)}</p>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid content-start gap-1 pr-3">
      <dd className="font-serif text-[28px] leading-[34px] tabular-nums md:text-[36px] md:leading-[42px]">
        <CountUp value={value} />
      </dd>
      <dt className="text-xs text-ink-muted">{label}</dt>
    </div>
  );
}
