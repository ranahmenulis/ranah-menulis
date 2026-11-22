"use client";

import { CountUp } from "@/components/ui/count-up";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { countdownLabel, elapsed } from "../event-face";
import { formatEventTime, type EventStateName, type WritingEvent } from "../event-model";
import { DateLeaf } from "./date-leaf";

/**
 * The anchor of an event page (DESIGN.md 6.7, Event umum): a dark band with the start as a large calendar
 * leaf, the title, the target as a rolling number, and a countdown with a line that fills as the
 * event runs. The countdown is plain text (not a live region); it changes once a minute.
 */
export function EventHero({
  event,
  now,
  state,
}: {
  event: WritingEvent;
  now: number;
  state: EventStateName;
}) {
  const t = useT().events;
  const locale = useLocale();
  const progress = elapsed(event, now);
  return (
    <header className="theme-dark app-band grid gap-6 p-6 text-ink sm:grid-cols-[auto_minmax(0,1fr)] md:p-8">
      <DateLeaf at={event.startsAt} zone={event.zone} size="lg" className="rm-cover-enter" />
      <div className="grid min-w-0 content-start gap-3">
        <p className="text-sm text-ink-muted">
          {t.status[state]} ·{" "}
          {format(t.list.participants, { count: String(event.participants.length) })}
        </p>
        <h1 className="rm-rise-in font-serif text-3xl leading-tight wrap-anywhere md:text-[40px]">
          {event.title}
        </h1>
        <p className="text-sm text-ink-soft">
          {formatEventTime(event.startsAt, event.zone, locale)} –{" "}
          {formatEventTime(event.endsAt, event.zone, locale)}
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="font-serif text-5xl leading-none font-light tabular-nums">
            <CountUp value={event.target} />
          </span>
          <span className="text-sm text-ink-soft">{t.detail.targetUnit}</span>
        </p>
        <div className="mt-2 grid gap-2">
          <p className="text-sm font-medium">{countdownLabel(event, now, locale)}</p>
          <span aria-hidden className="block h-0.5 bg-line">
            <i
              className="block h-full origin-left bg-ink transition-[scale] duration-700"
              style={{ scale: `${progress} 1` }}
            />
          </span>
        </div>
      </div>
    </header>
  );
}
