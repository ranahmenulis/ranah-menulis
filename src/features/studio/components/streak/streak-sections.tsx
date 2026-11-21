"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import type { StreakData } from "../../hooks/use-streak-data";
import { parseDay, weekStats } from "../../streak";
import { NO_STATISTICS } from "../../statistics-copy";
import { todayLine } from "../../streak-copy";
import { StreakHero } from "./streak-hero";

const shortDay = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

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
  const { target, todayWords, summary, lastDocument } = data;
  if (target === null) {
    return (
      <section aria-label="Hari ini" className="mt-6 grid gap-6">
        <div className="theme-dark app-band grid content-start justify-items-start gap-3 p-6 text-ink md:p-10">
          <p className="font-serif text-[28px] leading-9 font-semibold md:text-[36px] md:leading-[44px]">
            Belum ada target harian.
          </p>
          <p className="max-w-110 text-sm text-ink-soft">
            Tetapkan berapa kata yang ingin kamu tulis setiap hari. Setiap hari yang tercapai
            menjadi satu titik di kalendermu. Streak dihitung setelah kamu punya target; tulisan
            sebelum itu tetap tercatat di kalender.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSetTarget}>Tetapkan target</Button>
          <ButtonLink href={startHref} variant="text">
            Mulai menulis dulu
          </ButtonLink>
        </div>
      </section>
    );
  }
  return (
    <section aria-label="Hari ini" className="grid gap-5">
      <StreakHero data={data} reachedToday={reachedToday} />
      <div className="grid justify-items-start gap-3">
        <p className="text-base">
          {todayLine({
            target,
            todayWords,
            current: summary.current,
            broken: summary.current === 0 && summary.last !== null,
          })}
        </p>
        <ButtonLink href={startHref}>Mulai menulis</ButtonLink>
        {lastDocument && (
          <p className="text-xs text-ink-muted">
            Membuka dokumen terakhir, “{lastDocument.title || "Tanpa judul"}”. Angka hari ini
            berlanjut di bilah editor.
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
  const stats = weekStats(words, today, today.slice(0, 7));
  return (
    <section aria-label="Statistik ringkas">
      {hasWriting ? (
        <div className="border-t border-line pt-4">
          <dl className="grid grid-cols-3">
            <Stat value={stats.total} label="kata minggu ini" />
            <Stat value={stats.average} label="rata-rata per hari minggu ini" />
            <Stat
              value={stats.best ? stats.best.words : 0}
              label={
                stats.best
                  ? `kata, hari terbaik bulan ini (${shortDay.format(parseDay(stats.best.day))})`
                  : "kata, hari terbaik bulan ini"
              }
            />
          </dl>
          <ButtonLink href="/studio/statistik" variant="text" className="mt-3 -ml-3 text-ink">
            Lihat semua statistik
          </ButtonLink>
        </div>
      ) : (
        <p className="border-t border-line pt-4 text-sm text-ink-muted">{NO_STATISTICS}</p>
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
