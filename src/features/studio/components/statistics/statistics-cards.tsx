import type { ReactNode } from "react";
import { CountUp } from "@/components/ui/count-up";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Period, Summary } from "../../statistics";
import { formatDay, rangeName } from "../../statistics-copy";

function Stat({ value, label }: { value: ReactNode; label: string }) {
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
  const t = useT().studioStats.cards;
  const locale = useLocale();
  const { total, average, best, targetDays, metDays } = summary;
  return (
    <dl className="theme-dark app-band grid gap-8 p-6 text-ink md:p-10">
      <div className="flex min-w-0 flex-col-reverse justify-end gap-2">
        <dt className="text-sm text-ink-soft">
          {format(t.total, { range: rangeName(period, locale) })}
        </dt>
        <dd className="font-serif text-[64px] leading-[0.95] font-light [overflow-wrap:anywhere] tabular-nums md:text-[104px]">
          <CountUp value={total} />
        </dd>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-line pt-5">
        <Stat value={<CountUp value={average} />} label={t.average} />
        <Stat
          value={<CountUp value={best?.words ?? 0} />}
          label={best ? format(t.bestOn, { day: formatDay(best.day, locale) }) : t.best}
        />
        {targetDays > 0 ? (
          <Stat
            value={<CountUp value={metDays} />}
            label={format(t.metDays, { total: String(targetDays) })}
          />
        ) : (
          <Stat value="–" label={t.noTarget} />
        )}
      </div>
    </dl>
  );
}
