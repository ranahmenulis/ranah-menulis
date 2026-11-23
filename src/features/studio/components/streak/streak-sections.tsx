"use client";

import { Target, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { Button, ButtonLink } from "@/components/ui/button";
import { cardClass as studioCard } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import type { StreakData } from "../../hooks/use-streak-data";
import { parseDay, weekStats } from "../../streak";
import { noStatistics } from "../../statistics-copy";
import { shortDate, todayLine } from "../../streak-copy";
import { BookStack } from "./streak-art";
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
        <div className="relative isolate grid content-start justify-items-start gap-3 overflow-hidden rounded-2xl border border-line bg-linear-to-br from-surface from-40% to-accent-subtle p-6 text-ink shadow-card md:p-10">
          <p className="text-[28px] leading-9 font-bold tracking-tight md:text-[36px] md:leading-[44px]">
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
      <TargetCard target={target} onEdit={onSetTarget} />
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
      <RhythmCard />
    </section>
  );
}

/** The daily target with its edit button (only a daily target exists, client 17 November 2026). */
function TargetCard({ target, onEdit }: { target: number; onEdit: () => void }) {
  const t = useT().studioStreak.target;
  const f = useFormat();
  return (
    <div className={studioCard}>
      <div className="flex items-center gap-3">
        <Target size={22} aria-hidden className="text-accent-ink" />
        <p className="flex-1 heading-sm">{t.title}</p>
        <Button variant="secondary" size="sm" aria-label={t.editLabel} onClick={onEdit}>
          {t.edit}
        </Button>
      </div>
      <dl className="mt-4 flex items-center gap-3 border-t border-line pt-4 text-sm">
        <PencilSimple size={18} aria-hidden className="text-ink-muted" />
        <dt className="flex-1 text-ink-soft">{t.daily}</dt>
        <dd className="font-semibold tabular-nums">
          {format(t.value, { words: f.number(target) })}
        </dd>
      </dl>
    </div>
  );
}

/** A quiet encouragement card with a book stack. */
function RhythmCard() {
  const t = useT().studioStreak.rhythm;
  return (
    <div
      className={`${studioCard} flex items-center gap-4 bg-linear-to-r from-accent-subtle to-surface`}
    >
      <BookStack className="h-20 w-32 shrink-0 md:h-24 md:w-40" />
      <div className="min-w-0">
        <p className="heading-sm">{t.title}</p>
        <p className="mt-1 text-sm text-ink-soft">{t.body}</p>
      </div>
    </div>
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
        <div className={studioCard}>
          <dl className="grid grid-cols-3 divide-x divide-line">
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
        <p className={`${studioCard} text-sm text-ink-muted`}>{noStatistics(locale)}</p>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid content-start gap-1 px-3 first:pl-0">
      <dd className="text-[26px] leading-8 font-bold tabular-nums md:text-[32px] md:leading-[38px]">
        <CountUp value={value} />
      </dd>
      <dt className="text-xs text-ink-muted">{label}</dt>
    </div>
  );
}
