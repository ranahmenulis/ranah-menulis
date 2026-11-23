"use client";

import { Bunting } from "@/components/illustrations/event-art";
import { heroCardClass } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { countdownLabel } from "../event-face";
import { formatEventTime, type EventStateName, type WritingEvent } from "../event-model";
import { HeroBanner } from "../../components/community-hero";
import { DateLeaf } from "./date-leaf";
import { EventStatePill, EventTimeline } from "./event-pill";

/**
 * The anchor of an event page (DESIGN.md 6.7, 7.10): a hero card with the bunting as a band on top, the
 * start as a large calendar leaf, the state as a pill, the title, the target as the one large
 * number, and a countdown with a line that fills as the event runs. The countdown is plain text
 * (not a live region); it changes once a minute.
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
  return (
    <header className={cn(heroCardClass, "grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)]")}>
      <HeroBanner art={Bunting} className="sm:col-span-2" />
      <DateLeaf at={event.startsAt} zone={event.zone} size="lg" className="rm-cover-enter" />
      <div className="grid min-w-0 content-start gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <EventStatePill state={state} />
          {format(t.list.participants, { count: String(event.participants.length) })}
        </p>
        <h1 className="rm-rise-in text-[28px] leading-9 font-bold tracking-[-0.02em] wrap-anywhere md:text-[40px] md:leading-[48px]">
          {event.title}
        </h1>
        <p className="text-sm text-ink-soft">
          {formatEventTime(event.startsAt, event.zone, locale)} –{" "}
          {formatEventTime(event.endsAt, event.zone, locale)}
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="text-[56px] leading-[0.95] font-bold tracking-tight tabular-nums md:text-[64px]">
            <CountUp value={event.target} />
          </span>
          <span className="text-sm text-ink-soft">{t.detail.targetUnit}</span>
        </p>
        <div className="mt-2 grid max-w-md gap-2">
          <p className="text-sm font-medium">{countdownLabel(event, now, locale)}</p>
          <EventTimeline event={event} now={now} />
        </div>
      </div>
    </header>
  );
}
