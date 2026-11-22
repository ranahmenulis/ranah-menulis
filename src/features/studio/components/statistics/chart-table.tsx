import type { Locale } from "@/lib/i18n/config";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Bucket, Period } from "../../statistics";
import { bucketTitle, formatNumber, periodLabel, rangeName } from "../../statistics-copy";

function targetCell(bucket: Bucket, period: Period, daysOf: string, locale: Locale): string {
  if (period === "day") return bucket.target === null ? "–" : formatNumber(bucket.target, locale);
  return bucket.targetDays === 0
    ? "–"
    : format(daysOf, { met: String(bucket.metDays), total: String(bucket.targetDays) });
}

/** The chart as a plain table, newest first: every value reachable without pointing at a bar. */
export function ChartTable({ buckets, period }: { buckets: Bucket[]; period: Period }) {
  const t = useT().studioStats.table;
  const locale = useLocale();
  const rows = [...buckets].reverse();
  return (
    <details className="border-t border-line pt-3">
      <summary className="w-fit cursor-pointer text-sm text-ink-muted hover:text-ink">
        {t.summary}
      </summary>
      <div className="mt-3 max-h-80 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            {format(t.caption, {
              period: periodLabel(period, locale).toLowerCase(),
              range: rangeName(period, locale),
            })}
          </caption>
          <thead className="sticky top-0 bg-canvas text-left text-xs text-ink-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-normal">
                {t.period}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                {t.words}
              </th>
              <th scope="col" className="py-2 pl-3 text-right font-normal">
                {period === "day" ? t.target : t.metTarget}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bucket) => (
              <tr key={bucket.start} className="border-t border-line">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  {bucketTitle(bucket, period, locale)}
                </th>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(bucket.words, locale)}
                </td>
                <td className="py-2 pl-3 text-right text-ink-muted tabular-nums">
                  {targetCell(bucket, period, t.daysOf, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
