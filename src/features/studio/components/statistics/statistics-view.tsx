"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useStreakData } from "../../hooks/use-streak-data";
import { statistics, type Period } from "../../statistics";
import { NO_STATISTICS, PERIOD_LABEL, rangeName } from "../../statistics-copy";
import { studioStore } from "../../storage/store";
import { StudioTabs } from "../studio-tabs";
import { BarChart } from "./bar-chart";
import { ChartTable } from "./chart-table";
import { StatisticsCards } from "./statistics-cards";

const PERIODS: Period[] = ["day", "week", "month"];

function LoadingBlocks() {
  return (
    <div
      role="status"
      aria-label="Memuat statistik"
      className="mt-6 grid animate-[rm-appear_0s_300ms_forwards] gap-6 opacity-0"
    >
      <Skeleton className="h-8 w-56 rounded-full" />
      <Skeleton className="h-14 w-44" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}

/**
 * Studio, tab Statistik (PRD STK-05, DESIGN.md 6.6): words per day, week and month with the average,
 * the best day and the comparison with the target. From this device's writing log for now. The
 * empty state has no threshold of days or words ([konfirmasi]): one written word is enough.
 */
export function StatisticsView() {
  const data = useStreakData(studioStore);
  const [period, setPeriod] = useState<Period>("day");
  const { status, today, words, changes, lastDocument } = data;

  const hasWriting = useMemo(() => [...words.values()].some((w) => w > 0), [words]);
  const stats = useMemo(
    () => (status === "ready" ? statistics(words, changes, today, period) : null),
    [status, words, changes, today, period],
  );
  const startHref = lastDocument ? `/studio/${lastDocument.id}` : "/studio/baru";

  return (
    <div className="max-w-260">
      <h1 className="mb-3 heading-lg max-md:hidden">Studio</h1>
      <StudioTabs />

      {status === "loading" && <LoadingBlocks />}

      {status === "error" && (
        <div className="mt-6 grid gap-4">
          <ErrorBanner action={<RetryButton onClick={data.reload} />}>
            Statistik gagal dimuat. Tulisanmu tidak berubah; yang gagal hanya tampilannya.
          </ErrorBanner>
        </div>
      )}

      {status === "ready" && !hasWriting && (
        <EmptyState
          className="mt-4"
          action={<ButtonLink href={startHref}>Mulai menulis</ButtonLink>}
        >
          {NO_STATISTICS}
        </EmptyState>
      )}

      {stats && hasWriting && (
        <div className="mt-6 grid gap-8">
          <div role="group" aria-label="Satuan waktu" className="flex flex-wrap gap-2">
            {PERIODS.map((id) => (
              <Chip key={id} pressed={id === period} onClick={() => setPeriod(id)}>
                {PERIOD_LABEL[id]}
              </Chip>
            ))}
          </div>

          <StatisticsCards summary={stats.summary} period={period} />

          {stats.summary.total === 0 && (
            <p className="text-sm text-ink-muted">
              Tidak ada tulisan dalam {rangeName(period)}. Tulisan yang lebih lama tidak ditampilkan
              di sini.
            </p>
          )}

          <BarChart key={period} buckets={stats.buckets} period={period} />
          <ChartTable buckets={stats.buckets} period={period} />
        </div>
      )}
    </div>
  );
}
