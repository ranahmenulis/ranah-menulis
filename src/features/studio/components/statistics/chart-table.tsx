import type { Bucket, Period } from "../../statistics";
import { PERIOD_LABEL, bucketTitle, formatNumber, rangeName } from "../../statistics-copy";

function targetCell(bucket: Bucket, period: Period): string {
  if (period === "day") return bucket.target === null ? "–" : formatNumber(bucket.target);
  return bucket.targetDays === 0 ? "–" : `${bucket.metDays} dari ${bucket.targetDays} hari`;
}

/** The chart as a plain table, newest first: every value reachable without pointing at a bar. */
export function ChartTable({ buckets, period }: { buckets: Bucket[]; period: Period }) {
  const rows = [...buckets].reverse();
  return (
    <details className="border-t border-line pt-3">
      <summary className="w-fit cursor-pointer text-sm text-ink-muted hover:text-ink">
        Lihat sebagai tabel
      </summary>
      <div className="mt-3 max-h-80 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Statistik {PERIOD_LABEL[period].toLowerCase()}, {rangeName(period)}
          </caption>
          <thead className="sticky top-0 bg-canvas text-left text-xs text-ink-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-normal">
                Periode
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Kata
              </th>
              <th scope="col" className="py-2 pl-3 text-right font-normal">
                {period === "day" ? "Target" : "Memenuhi target"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bucket) => (
              <tr key={bucket.start} className="border-t border-line">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  {bucketTitle(bucket, period)}
                </th>
                <td className="px-3 py-2 text-right tabular-nums">{formatNumber(bucket.words)}</td>
                <td className="py-2 pl-3 text-right text-ink-muted tabular-nums">
                  {targetCell(bucket, period)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
