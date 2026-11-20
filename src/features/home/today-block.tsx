"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { formatChanged } from "@/features/studio/relative-time";
import { FirstSteps } from "./steps";
import { Section } from "./today-row";
import { WordTotals } from "./week-summary";

const number = new Intl.NumberFormat("id-ID");

/** The one box of Beranda, like Medium's "Write, grow" card: one thing to do now. */
const card = "border border-line p-5 md:p-6";

function Continue({ data }: { data: StreakData }) {
  const doc = data.lastDocument;
  if (!doc) {
    return (
      <div className={`${card} flex flex-wrap items-center justify-between gap-4`}>
        <p className="font-serif text-xl leading-7 font-semibold">Belum ada dokumen.</p>
        <ButtonLink href="/studio/baru">Mulai menulis</ButtonLink>
      </div>
    );
  }
  return (
    <div className={`${card} grid gap-4 sm:flex sm:items-end sm:justify-between`}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-muted">Lanjutkan menulis</p>
        <p className="mt-1.5 font-serif text-xl leading-7 font-semibold [overflow-wrap:anywhere] md:text-2xl md:leading-8">
          {doc.title || "Tanpa judul"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {number.format(doc.wordCount)} kata · diubah {formatChanged(doc.updatedAt, data.nowMs)} ·
          Pribadi
        </p>
      </div>
      <ButtonLink href={`/studio/${doc.id}`} className="shrink-0 justify-self-start">
        Lanjutkan
      </ButtonLink>
    </div>
  );
}

function Loading() {
  return (
    <div
      role="status"
      aria-label="Memuat Hari ini"
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
  if (data.status === "loading") return <Loading />;
  if (data.status === "error") {
    return (
      <ErrorBanner action={<RetryButton onClick={data.reload} />}>
        Hari ini gagal dimuat. Isi dokumenmu tidak berubah; blok lain di Beranda tetap bisa dipakai.
      </ErrorBanner>
    );
  }
  if (showSteps) {
    return (
      <div className={card}>
        <p className="text-xs font-medium text-ink-muted">Tiga langkah awal</p>
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
  if (data.status !== "ready") return null;
  const { target, todayWords, summary } = data;
  if (target === null) {
    return (
      <Section title="Progres hari ini">
        <p className="text-sm text-ink-muted">Belum ada target harian.</p>
        <ButtonLink
          href="/studio/streak"
          variant="text"
          size="sm"
          className="justify-self-start px-0 text-ink"
        >
          Tetapkan target
        </ButtonLink>
        <WordTotals data={data} />
      </Section>
    );
  }
  const label = `Progres hari ini ${todayWords} dari ${target} kata, streak ${summary.current} hari. Buka Streak`;
  return (
    <Section title="Progres hari ini">
      <Link href="/studio/streak" aria-label={label} className="grid gap-2 text-sm no-underline">
        <span className="flex items-baseline gap-1.5 tabular-nums">
          <b className="font-medium">{number.format(todayWords)}</b>
          <span className="text-ink-muted">/ {number.format(target)} kata</span>
          <span className="ml-auto">Streak {summary.current} hari</span>
        </span>
        <span aria-hidden className="h-1 bg-line">
          <i
            className="block h-full bg-ink"
            style={{ width: `${Math.min(100, (todayWords / target) * 100)}%` }}
          />
        </span>
      </Link>
      <WordTotals data={data} />
    </Section>
  );
}
