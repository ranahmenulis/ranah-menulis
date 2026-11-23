import { useId } from "react";
import type { Icon } from "@phosphor-icons/react";
import { CalendarBlank, Clock, MinusCircle, PencilSimple } from "@phosphor-icons/react/dist/ssr";
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
  const items: { label: string; value: string | null; Icon: Icon }[] = [
    {
      Icon: PencilSimple,
      label: t.pace,
      value: pace === null ? null : format(t.paceValue, { words: formatNumber(pace, locale) }),
    },
    {
      Icon: CalendarBlank,
      label: t.favoriteDay,
      value: favoriteDay === null ? null : t.days[favoriteDay],
    },
    {
      Icon: Clock,
      label: t.favoriteHour,
      value: favoriteHour === null ? null : hourRange(favoriteHour, t.clockSeparator),
    },
    {
      Icon: MinusCircle,
      label: t.wordsReduced,
      value: wordsReduced === null ? null : formatNumber(wordsReduced, locale),
    },
  ];
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6"
    >
      <h2 id={titleId} className="heading-md">
        {t.heading}
      </h2>
      <dl className="mt-2">
        {items.map(({ Icon, label, value }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-3 border-b border-line py-3 last:border-b-0"
          >
            <Icon size={18} aria-hidden className="shrink-0 text-accent-ink" />
            <dt className="flex-1 text-sm text-ink-soft">{label}</dt>
            <dd className="text-right text-sm font-medium [overflow-wrap:anywhere] text-ink tabular-nums">
              {value ?? t.notEnough}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-ink-muted">{t.note}</p>
    </section>
  );
}
