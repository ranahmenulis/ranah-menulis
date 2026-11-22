"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { axisTicks, type Bucket, type Period } from "../../statistics";
import { axisLabel, rangeName, readout, tickLabel, unitName } from "../../statistics-copy";

/** An x label shows on every Nth bar counting back from the latest (months: see below). */
const LABEL_STEP = { day: 6, week: 2 } as const;

type LabelMode = "always" | "wide" | null;

/** Months label every second bar on phones and every bar from md up. */
function labelMode(index: number, last: number, period: Period): LabelMode {
  const back = last - index;
  if (period === "month") return back % 2 === 0 ? "always" : "wide";
  return back % LABEL_STEP[period] === 0 ? "always" : null;
}

const pct = (value: number, top: number) => `${(value / top) * 100}%`;

/**
 * One series of monochrome bars (DESIGN.md 6.6): ink bars at most 24px thick, hairline grid, a
 * 2px gap, and a target line behind the bars on the daily view. The readout line above names the
 * active bar and works for hover, touch dragging and the arrow keys; the table view next to the
 * chart carries every value, so nothing depends on pointing.
 */
export function BarChart({ buckets, period }: { buckets: Bucket[]; period: Period }) {
  const t = useT().studioStats.chart;
  const locale = useLocale();
  const [picked, setPicked] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const plot = useRef<HTMLDivElement>(null);
  const readoutId = useId();

  const last = buckets.length - 1;
  const active = picked ?? last;
  const max = Math.max(...buckets.map((b) => Math.max(b.words, b.target ?? 0)));
  const ticks = axisTicks(max);
  const top = ticks[ticks.length - 1];
  const hasTarget = buckets.some((b) => b.target !== null);

  const select = (index: number) => setPicked(Math.min(last, Math.max(0, index)));

  function pick(event: PointerEvent) {
    const rect = plot.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    select(Math.floor(((event.clientX - rect.left) / rect.width) * buckets.length));
  }

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key]);
  }

  return (
    <figure className="grid gap-3">
      <figcaption
        id={readoutId}
        aria-live={focused ? "polite" : "off"}
        className="min-h-11 text-sm [overflow-wrap:anywhere] md:min-h-6"
      >
        {readout(buckets[active], period, locale)}
      </figcaption>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 pt-2">
        <div aria-hidden className="relative w-10">
          {ticks.map((tick) => (
            <span
              key={tick}
              style={{ bottom: pct(tick, top) }}
              className="absolute right-0 translate-y-1/2 text-xs text-ink-muted"
            >
              {tickLabel(tick, top, locale)}
            </span>
          ))}
        </div>

        <div
          ref={plot}
          role="group"
          tabIndex={0}
          aria-roledescription={t.roleDescription}
          aria-label={format(t.label, {
            unit: unitName(period, locale),
            range: rangeName(period, locale),
          })}
          aria-describedby={readoutId}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={(event) => {
            // A mouse that leaves goes back to the latest bar; touch and keyboard keep their pick.
            if (event.pointerType === "mouse" && !focused) setPicked(null);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="relative h-60 touch-pan-y md:h-72"
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden
              style={{ bottom: pct(tick, top) }}
              className={cn("absolute inset-x-0 h-px", tick === 0 ? "bg-line-strong" : "bg-line")}
            />
          ))}
          <div aria-hidden className="absolute inset-0 flex gap-0.5">
            {buckets.map((bucket, index) => (
              <div
                key={bucket.start}
                className={cn(
                  "relative flex min-w-0 flex-1 items-end justify-center",
                  index === active && "bg-subtle",
                )}
              >
                {bucket.target !== null && (
                  <span
                    style={{ bottom: pct(bucket.target, top) }}
                    className="absolute -inset-x-px h-px bg-ink-muted"
                  />
                )}
                {bucket.words > 0 && (
                  <span
                    style={{ height: pct(bucket.words, top), "--i": index } as CSSProperties}
                    className="rm-bar relative block min-h-0.5 w-full max-w-6 bg-ink"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <span />
        <div aria-hidden className="relative flex h-6 gap-0.5">
          {buckets.map((bucket, index) => {
            const mode = labelMode(index, last, period);
            return (
              <div key={bucket.start} className="relative min-w-0 flex-1">
                {mode && (
                  <span
                    className={cn(
                      "absolute top-1.5 text-xs whitespace-nowrap text-ink-muted",
                      // The last label hugs the right edge instead of poking out past the page.
                      index === last ? "right-0" : "left-1/2 -translate-x-1/2",
                      mode === "wide" && "max-md:hidden",
                    )}
                  >
                    {axisLabel(bucket, period, locale)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasTarget && (
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <span aria-hidden className="h-px w-4 bg-ink-muted" />
          {t.targetLegend}
        </p>
      )}
    </figure>
  );
}
