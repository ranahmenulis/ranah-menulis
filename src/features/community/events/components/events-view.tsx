"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Bunting } from "@/components/illustrations/event-art";
import { ButtonLink } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { ErrorBanner, FeedItemSkeleton, RetryButton } from "@/components/ui/states";
import { HOME_HREF } from "@/features/app-shell/nav";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useGroupReader } from "../../groups/group-viewer";
import { CommunityEmpty } from "../../components/community-empty";
import { CommunityFrame } from "../../components/community-frame";
import { CommunityHero, type HeroStat } from "../../components/community-hero";
import { entryOf, eventHref, eventState, formatEventTime, type WritingEvent } from "../event-model";
import { countdownLabel } from "../event-face";
import { refreshEvents, useEvents } from "../event-store";
import { useEventClock } from "../use-event-clock";
import { DateLeaf } from "./date-leaf";
import { EventStatePill, EventTimeline } from "./event-pill";

export function EventsError() {
  const t = useT().events.list;
  return <ErrorBanner action={<RetryButton onClick={refreshEvents} />}>{t.loadError}</ErrorBanner>;
}

export function EventSummary({ event, now }: { event: WritingEvent; now: number }) {
  const t = useT().events;
  const locale = useLocale();
  return (
    <p className="text-sm wrap-anywhere text-ink-muted">
      {t.status[eventState(event, now)]} · {formatEventTime(event.startsAt, event.zone, locale)} ·{" "}
      {format(t.list.participants, { count: String(event.participants.length) })}
    </p>
  );
}

/** The Event hero's figures: events in progress, and the ones you joined, upcoming and finished. */
export function eventCounts(events: readonly WritingEvent[], now: number, reader: string | null) {
  const states = events.map((event) => eventState(event, now));
  return {
    open: states.filter((state) => state === "open" || state === "full").length,
    upcoming: states.filter((state) => state === "upcoming").length,
    finished: states.filter((state) => state === "finished").length,
    joined: reader ? events.filter((event) => entryOf(event, reader)).length : 0,
  };
}

function EventCard({ event, now }: { event: WritingEvent; now: number }) {
  const t = useT().events.list;
  const locale = useLocale();
  const state = eventState(event, now);
  return (
    <Link
      href={eventHref(event.id)}
      className={cn(
        cardClass,
        "group grid h-full grid-cols-[auto_minmax(0,1fr)] items-start gap-4 no-underline transition-colors hover:border-accent-ink/40 md:gap-5",
      )}
    >
      <DateLeaf
        at={event.startsAt}
        zone={event.zone}
        className="transition-[translate,rotate] duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-3 motion-reduce:transition-none"
      />
      <span className="grid min-w-0 gap-2">
        <EventStatePill state={state} />
        <h2 className="heading-md wrap-anywhere text-ink group-hover:underline group-hover:underline-offset-3">
          {event.title}
        </h2>
        <span className="text-sm wrap-anywhere text-ink-muted">
          {formatEventTime(event.startsAt, event.zone, locale)} ·{" "}
          {format(t.participants, { count: String(event.participants.length) })}
        </span>
        <span className="line-clamp-2 text-sm wrap-anywhere text-ink-soft">
          {event.description}
        </span>
        <span className="mt-1 grid gap-2">
          <span className="text-sm font-medium text-ink">{countdownLabel(event, now, locale)}</span>
          <EventTimeline event={event} now={now} />
        </span>
      </span>
    </Link>
  );
}

/** The Event tab of Community (COM-13): a hero with the bunting, then one card per event. */
export function EventsView() {
  const t = useT().events.list;
  const data = useEvents();
  const now = useEventClock(1000);
  const reader = useGroupReader();
  const events = data.status === "ready" && now !== null ? data.events : null;
  const counts = events && now !== null ? eventCounts(events, now, reader) : null;
  const stats: HeroStat[] = counts
    ? [
        ...(reader ? [{ label: t.hero.joined, value: counts.joined }] : []),
        { label: t.hero.upcoming, value: counts.upcoming },
        { label: t.hero.finished, value: counts.finished },
      ]
    : [];
  return (
    <CommunityFrame>
      <CommunityHero
        titleId="events-title"
        title={t.title}
        body={t.hero.body}
        art={Bunting}
        figure={{ value: counts?.open ?? null, label: t.hero.figure }}
        stats={stats}
      />
      {data.status === "error" ? (
        <EventsError />
      ) : !events || now === null ? (
        <FeedItemSkeleton />
      ) : events.length === 0 ? (
        <CommunityEmpty
          card
          art={Bunting}
          action={
            <ButtonLink variant="secondary" href={HOME_HREF}>
              {t.toHome}
            </ButtonLink>
          }
        >
          {t.empty}
        </CommunityEmpty>
      ) : (
        <ul className="grid gap-4 @3xl:grid-cols-2 @[77.5rem]:grid-cols-3">
          {events
            .toSorted((a, b) => b.startsAt - a.startsAt)
            .map((event, index) => (
              <li
                key={event.id}
                className="rm-row-in min-w-0"
                style={{ "--i": Math.min(index, 12) } as CSSProperties}
              >
                <EventCard event={event} now={now} />
              </li>
            ))}
        </ul>
      )}
    </CommunityFrame>
  );
}
