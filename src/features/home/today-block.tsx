"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { DocumentMark } from "@/features/studio/components/documents/document-mark";
import { TodayRing } from "@/features/studio/components/streak/today-ring";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { formatChanged } from "@/features/studio/relative-time";
import { formatNumber } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { FirstSteps } from "./steps";
import { Section } from "./today-row";
import { WordTotals } from "./week-summary";

/** The box for the first steps and the loading placeholder. */
const card = "border border-line p-5 md:p-6";

/**
 * The anchor of Beranda (DESIGN.md 6.2): a dark band with the document you were writing, drawn as
 * its page, and today's ring when there is a daily target. The one filled button sits under it.
 */
function Continue({ data }: { data: StreakData }) {
  const t = useT().home.today;
  const locale = useLocale();
  const doc = data.lastDocument;
  const ring = data.target !== null && (
    <TodayRing words={data.todayWords} target={data.target} compact />
  );
  return (
    <div className="grid gap-4">
      <div className="theme-dark app-band grid items-center gap-6 p-6 text-ink sm:grid-cols-[minmax(0,1fr)_auto] md:p-8">
        <div className="flex min-w-0 items-start gap-5">
          {/* The wrapper sets the width: DocumentMark is w-full and cn() does not merge classes. */}
          <div className="w-14 shrink-0 md:w-16">
            <DocumentMark page={doc ?? { id: "baru", wordCount: 0 }} className="rm-cover-enter" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-ink-muted">{doc ? t.continue : t.firstPage}</p>
            <p className="rm-rise-in mt-2 font-serif text-2xl leading-8 [overflow-wrap:anywhere] md:text-[30px] md:leading-10">
              {doc ? doc.title || t.untitled : t.noDocument}
            </p>
            {doc && (
              <p
                className="rm-rise-in mt-2 text-sm text-ink-soft"
                style={{ "--i": 1 } as CSSProperties}
              >
                {format(t.meta, {
                  words: formatNumber(doc.wordCount, locale),
                  changed: formatChanged(doc.updatedAt, data.nowMs, locale),
                })}
              </p>
            )}
          </div>
        </div>
        {ring}
      </div>
      {doc ? (
        <ButtonLink href={`/studio/${doc.id}`} className="justify-self-start">
          {t.continueButton}
        </ButtonLink>
      ) : (
        <ButtonLink href="/studio/baru" className="justify-self-start">
          {t.start}
        </ButtonLink>
      )}
    </div>
  );
}

function Loading() {
  const t = useT().home.today;
  return (
    <div
      role="status"
      aria-label={t.loading}
      className={`${card} grid animate-[rm-appear_0s_300ms_forwards] gap-2.5 opacity-0`}
    >
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-6 w-3/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

/**
 * The center of Beranda (PLT-10, Brief 4A): the answer to "what should I do now", as one card with
 * one filled button. A new writer sees the first steps there instead, so no action appears twice.
 */
export function TodayCard({ data, showSteps }: { data: StreakData; showSteps: boolean }) {
  const t = useT().home.today;
  if (data.status === "loading") return <Loading />;
  if (data.status === "error") {
    return <ErrorBanner action={<RetryButton onClick={data.reload} />}>{t.loadError}</ErrorBanner>;
  }
  if (showSteps) {
    return (
      <div className={card}>
        <p className="text-xs font-medium text-ink-muted">{t.stepsTitle}</p>
        <FirstSteps hasTarget={data.target !== null} hasDocument={data.lastDocument !== null} />
      </div>
    );
  }
  return <Continue data={data} />;
}

/**
 * "Progres hari ini" in the side column: today's words against the daily target, the streak, and
 * the three word totals. Drawn only once the data is ready.
 */
export function ProgressSection({ data }: { data: StreakData }) {
  const t = useT().home.progress;
  const locale = useLocale();
  if (data.status !== "ready") return null;
  const { target, todayWords, summary } = data;
  if (target === null) {
    return (
      <Section title={t.title}>
        <p className="text-sm text-ink-muted">{t.noTarget}</p>
        <ButtonLink
          href="/studio/streak"
          variant="text"
          size="sm"
          className="justify-self-start px-0 text-ink"
        >
          {t.setTarget}
        </ButtonLink>
        <WordTotals data={data} />
      </Section>
    );
  }
  const label = format(t.label, {
    words: formatNumber(todayWords, locale),
    target: formatNumber(target, locale),
    streak: formatNumber(summary.current, locale),
  });
  return (
    <Section title={t.title}>
      <Link
        href="/studio/streak"
        aria-label={label}
        className="group flex items-center gap-3 no-underline"
      >
        <span className="font-serif text-[44px] leading-none font-light tabular-nums">
          <CountUp value={summary.current} />
        </span>
        <span className="grid text-sm">
          <span className="group-hover:underline group-hover:underline-offset-3">
            {t.streakDays}
          </span>
          <span className="text-xs text-ink-muted tabular-nums">
            {format(t.todayWords, {
              words: formatNumber(todayWords, locale),
              target: formatNumber(target, locale),
            })}
          </span>
        </span>
      </Link>
      <WordTotals data={data} />
    </Section>
  );
}
