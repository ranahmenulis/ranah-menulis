"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { buildSampleHistory } from "../../sample-history";
import { studioStore } from "../../storage/store";
import { useStreakData } from "../../hooks/use-streak-data";
import { addDays, milestones, parseDay, pastStreaks } from "../../streak";
import { DEFAULT_TARGET, saveTargets } from "../../target-setting";
import { StudioTabs } from "../studio-tabs";
import { capitalizeFirst } from "../../streak-copy";
import { StatsSection, TodaySection } from "./streak-sections";
import { MilestoneList } from "./milestone-list";
import { StreakHistory } from "./streak-history";
import { StreakCalendar } from "./streak-calendar";
import { TargetDialog } from "./target-dialog";

const headDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function LoadingBlocks() {
  return (
    <div
      role="status"
      aria-label="Memuat Streak"
      className="mt-6 grid animate-[rm-appear_0s_300ms_forwards] gap-8 opacity-0"
    >
      <div className="grid gap-3">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-13 w-44" />
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="mt-2 h-10 w-36 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Studio, tab Streak (DESIGN.md 5.3, 5.4, 7.3). Today's progress, the current streak, the month in
 * ink dots, three plain statistics, and milestones. Data is this device's writing log for now.
 */
export function StreakView() {
  const data = useStreakData(studioStore);
  const toast = useToast();
  const [dialog, setDialog] = useState(false);
  const { status, today, target, todayWords, words, history, changes, lastDocument } = data;

  const reachedToday = target !== null && todayWords >= target;
  const hasWriting = [...words.values()].some((w) => w > 0);
  const startHref = lastDocument ? `/studio/${lastDocument.id}` : "/studio/baru";
  const showSeed = process.env.NODE_ENV !== "production" && !hasWriting && status === "ready";

  async function seed() {
    await studioStore.importHistory(buildSampleHistory(today));
    // Sample days count toward a streak only if a target already applied back then.
    if (changes.length === 0) {
      saveTargets(window.localStorage, [{ from: addDays(today, -30), value: DEFAULT_TARGET }]);
    }
    data.reload();
  }

  return (
    <div className="max-w-260">
      <h1 className="mb-3 heading-lg max-md:hidden">Studio</h1>
      <StudioTabs />

      {status === "loading" && <LoadingBlocks />}

      {status === "error" && (
        <div className="mt-6 grid gap-4">
          <ErrorBanner action={<RetryButton onClick={data.reload} />}>
            Streak gagal dimuat. Tulisanmu tidak berubah; yang gagal hanya tampilannya.
          </ErrorBanner>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-ink-muted">
              {capitalizeFirst(headDate.format(parseDay(today)))}
              <span className="normal-case"> · hari berganti pukul 00.00</span>
            </span>
            {target !== null && (
              <Button variant="text" className="ml-auto text-ink" onClick={() => setDialog(true)}>
                Atur target
              </Button>
            )}
          </div>

          <TodaySection
            data={data}
            startHref={startHref}
            reachedToday={reachedToday}
            onSetTarget={() => setDialog(true)}
          />

          <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div className="grid content-start gap-8">
              <StreakCalendar
                today={today}
                words={words}
                history={history}
                changes={changes}
                celebrate={false}
              />
              <StatsSection words={words} today={today} hasWriting={hasWriting} />
            </div>
            <div className="grid content-start gap-8">
              <MilestoneList items={milestones(words, changes, today)} today={today} />
              {target !== null && <StreakHistory items={pastStreaks(words, changes, today)} />}
            </div>
          </div>

          {showSeed && (
            <p className="mt-12 text-xs text-ink-muted">
              Pengembangan:{" "}
              <button
                type="button"
                onClick={seed}
                className="cursor-pointer underline underline-offset-3"
              >
                isi 30 hari data contoh
              </button>
            </p>
          )}

          <TargetDialog
            key={String(dialog)}
            open={dialog}
            current={target}
            onClose={() => setDialog(false)}
            onSave={(value) => {
              data.setTarget(value);
              setDialog(false);
              toast({
                message:
                  target === null
                    ? "Target harian disimpan."
                    : "Target disimpan. Berlaku mulai besok.",
              });
            }}
          />
        </>
      )}
    </div>
  );
}
