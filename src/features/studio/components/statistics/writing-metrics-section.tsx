import { useId } from "react";
import type { WritingMetrics } from "../../statistics-activity";
import { formatNumber } from "../../statistics-copy";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const clockHour = (hour: number) => `${String(hour).padStart(2, "0")}.00`;

function hourRange(hour: number): string {
  return `${clockHour(hour)}–${clockHour((hour + 1) % 24)}`;
}

export function WritingMetricsSection({ metrics }: { metrics: WritingMetrics }) {
  const titleId = useId();
  const { pace, favoriteDay, favoriteHour, wordsReduced } = metrics;
  const items = [
    { label: "Tempo", value: pace === null ? null : `${formatNumber(pace)} kata per hari menulis` },
    { label: "Hari favorit", value: favoriteDay === null ? null : DAYS[favoriteDay] },
    { label: "Jam favorit", value: favoriteHour === null ? null : hourRange(favoriteHour) },
    { label: "Kata berkurang", value: wordsReduced === null ? null : formatNumber(wordsReduced) },
  ];
  return (
    <section aria-labelledby={titleId} className="border-t border-line pt-4">
      <h2 id={titleId} className="heading-md">
        Metrik menulis
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
        {items.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="mt-1 text-sm [overflow-wrap:anywhere] text-ink tabular-nums">
              {value ?? "Belum cukup data"}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-ink-muted">
        Tempo hanya menghitung hari dengan kata tercatat. Kata berkurang menjumlahkan selisih saat
        jumlah kata turun antara dua simpanan. Penggantian dengan jumlah kata yang sama bernilai
        nol.
      </p>
    </section>
  );
}
