import { useId } from "react";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { WritingMetrics } from "../../statistics-activity";
import { formatNumber } from "../../statistics-copy";

function hourRange(hour: number, separator: string): string {
  const clock = (value: number) => `${String(value).padStart(2, "0")}${separator}00`;
  return `${clock(hour)}–${clock((hour + 1) % 24)}`;
}

export function WritingMetricsSection({ metrics }: { metrics: WritingMetrics }) {
  const t = useT().studioStats.metrics;
  const locale = useLocale();
  const titleId = useId();
  const { pace, favoriteDay, favoriteHour, wordsReduced } = metrics;
  const items = [
    {
      label: t.pace,
      value: pace === null ? null : format(t.paceValue, { words: formatNumber(pace, locale) }),
    },
    { label: t.favoriteDay, value: favoriteDay === null ? null : t.days[favoriteDay] },
    {
      label: t.favoriteHour,
      value: favoriteHour === null ? null : hourRange(favoriteHour, t.clockSeparator),
    },
    {
      label: t.wordsReduced,
      value: wordsReduced === null ? null : formatNumber(wordsReduced, locale),
    },
  ];
  return (
    <section aria-labelledby={titleId} className="border-t border-line pt-4">
      <h2 id={titleId} className="heading-md">
        {t.heading}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
        {items.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="mt-1 text-sm [overflow-wrap:anywhere] text-ink tabular-nums">
              {value ?? t.notEnough}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-ink-muted">{t.note}</p>
    </section>
  );
}
