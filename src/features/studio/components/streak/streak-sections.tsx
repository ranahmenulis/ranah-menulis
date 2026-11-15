"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import type { StreakData } from "../../hooks/use-streak-data";
import { parseDay, weekStats } from "../../streak";
import { formatRun, streakLine, todayLine } from "../../streak-copy";

const number = new Intl.NumberFormat("id-ID");
const shortDay = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

function Figure({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="figure">{value}</span>
      <span className="text-sm text-ink-muted">{unit}</span>
    </div>
  );
}

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
  return (
    <section
      aria-label="Hari ini"
      className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:gap-12"
    >
      {target === null ? (
        <div className="grid content-start justify-items-start gap-3">
          <p className="font-serif text-xl leading-7 font-semibold">Belum ada target harian.</p>
          <p className="max-w-110 text-sm text-ink-muted">
            Tetapkan berapa kata yang ingin kamu tulis setiap hari. Setiap hari yang tercapai
            menjadi satu titik di kalendermu.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button onClick={onSetTarget}>Tetapkan target</Button>
            <ButtonLink href={startHref} variant="text">
              Mulai menulis dulu
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid content-start gap-3">
          <p className="text-sm font-medium text-ink-muted">Hari ini</p>
          <Figure value={number.format(todayWords)} unit={`/ ${number.format(target)} kata`} />
          <div
            role="progressbar"
            aria-label="Progres hari ini"
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={todayWords}
            className="h-1 bg-line"
          >
            <i
              className="block h-full origin-left bg-ink"
              style={{ width: `${Math.min(100, (todayWords / target) * 100)}%` }}
            />
          </div>
          <p className="text-sm">
            {todayLine({
              target,
              todayWords,
              current: summary.current,
              broken: summary.current === 0 && summary.last !== null,
            })}
          </p>
          <div className="mt-2 grid justify-items-start gap-2">
            <ButtonLink href={startHref}>Mulai menulis</ButtonLink>
            {lastDocument && (
              <p className="text-xs text-ink-muted">
                Membuka dokumen terakhir, “{lastDocument.title || "Tanpa judul"}”. Angka hari ini
                berlanjut di bilah editor.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid content-start gap-3">
        <p className="text-sm font-medium text-ink-muted">Streak saat ini</p>
        {target === null ? (
          <p className="text-sm">
            Streak dihitung setelah kamu punya target. Tulisan sebelum itu tetap tercatat di
            kalender.
          </p>
        ) : (
          <>
            <Figure value={String(summary.current)} unit="hari berturut-turut" />
            <p className="text-sm text-ink-muted">
              {streakLine({ reachedToday, current: summary.current, last: summary.last })}
            </p>
            {summary.longest && (
              <p className="text-sm">
                Terpanjang: {summary.longest.length} hari, {formatRun(summary.longest)}
              </p>
            )}
          </>
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
        <dl className="grid grid-cols-3 border-t border-line pt-4">
          <Stat value={number.format(stats.total)} label="kata minggu ini" />
          <Stat value={number.format(stats.average)} label="rata-rata per hari minggu ini" />
          <Stat
            value={stats.best ? number.format(stats.best.words) : "0"}
            label={
              stats.best
                ? `kata, hari terbaik bulan ini (${shortDay.format(parseDay(stats.best.day))})`
                : "kata, hari terbaik bulan ini"
            }
          />
        </dl>
      ) : (
        <p className="border-t border-line pt-4 text-sm text-ink-muted">
          Belum cukup data untuk statistik. Tulis beberapa hari, lalu angkanya muncul di sini.
        </p>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid content-start gap-1 pr-3">
      <dd className="font-serif text-[28px] leading-[34px] tabular-nums">{value}</dd>
      <dt className="text-xs text-ink-muted">{label}</dt>
    </div>
  );
}
