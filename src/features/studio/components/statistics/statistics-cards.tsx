import type { Period, Summary } from "../../statistics";
import { formatDay, formatNumber, rangeName } from "../../statistics-copy";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col-reverse justify-end gap-1">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-serif text-[22px] leading-7 [overflow-wrap:anywhere] tabular-nums md:text-[28px] md:leading-[34px]">
        {value}
      </dd>
    </div>
  );
}

/**
 * The numbers above the chart (DESIGN.md 6.6): the total as the one large figure, then the average,
 * the best day and the target comparison as three plain statistics.
 */
export function StatisticsCards({ summary, period }: { summary: Summary; period: Period }) {
  const { total, average, best, targetDays, metDays } = summary;
  return (
    <dl className="grid gap-6">
      <div className="flex min-w-0 flex-col-reverse justify-end gap-2">
        <dt className="text-xs text-ink-muted">kata dalam {rangeName(period)}</dt>
        <dd className="figure [overflow-wrap:anywhere]">{formatNumber(total)}</dd>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-line pt-4">
        <Stat value={formatNumber(average)} label="rata-rata kata per hari" />
        <Stat
          value={formatNumber(best?.words ?? 0)}
          label={best ? `kata, hari terbaik (${formatDay(best.day)})` : "kata, hari terbaik"}
        />
        {targetDays > 0 ? (
          <Stat value={formatNumber(metDays)} label={`dari ${targetDays} hari memenuhi target`} />
        ) : (
          <Stat value="–" label="hari memenuhi target, belum ada data" />
        )}
      </div>
    </dl>
  );
}
