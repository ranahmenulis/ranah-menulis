import type { ReactNode } from "react";
import { CountUp } from "@/components/ui/count-up";
import { heroCardClass } from "@/components/ui/card";
import { RisingPath } from "@/components/illustrations/path-art";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Period, Summary } from "../../statistics";
import { formatDay, rangeName } from "../../statistics-copy";

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col-reverse justify-end gap-1">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-[22px] leading-7 font-bold [overflow-wrap:anywhere] tabular-nums md:text-[28px] md:leading-[34px]">
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
    <div className={`${heroCardClass} md:p-6`}>
      <RisingPath className="absolute top-0 right-0 -z-10 h-[58%] w-[66%] [mask-image:linear-gradient(to_right,transparent,#000_45%),linear-gradient(to_bottom,#000_60%,transparent)] [mask-composite:intersect] md:h-[68%] md:w-[56%]" />
      <dl className="grid gap-6">
        <div className="flex min-w-0 flex-col-reverse justify-end gap-2">
          <dt className="text-sm text-ink-muted">
            {format(t.total, { range: rangeName(period, locale) })}
          </dt>
          <dd className="text-[56px] leading-[0.95] font-bold tracking-tight [overflow-wrap:anywhere] tabular-nums md:text-[80px]">
            <CountUp value={total} />
          </dd>
        </div>
        <div className="grid grid-cols-3 divide-x divide-line border-t border-line pt-5 [&>div]:px-3 [&>div:first-child]:pl-0">
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
    </div>
  );
}
