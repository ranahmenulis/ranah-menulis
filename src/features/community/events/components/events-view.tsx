"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorBanner, FeedItemSkeleton, RetryButton } from "@/components/ui/states";
import { HOME_HREF } from "@/features/app-shell/nav";
import { BackShell } from "@/features/kelola/components/back-shell";
import {
  eventHref,
  eventState,
  eventStatus,
  formatEventTime,
  type WritingEvent,
} from "../event-model";
import { countdownLabel } from "../event-face";
import { refreshEvents, useEvents } from "../event-store";
import { useEventClock } from "../use-event-clock";
import { DateLeaf } from "./date-leaf";

export function EventsError() {
  return (
    <ErrorBanner action={<RetryButton onClick={refreshEvents} />}>
      Data event di perangkat ini belum bisa dibuka.
    </ErrorBanner>
  );
}

export function EventSummary({ event, now }: { event: WritingEvent; now: number }) {
  return (
    <p className="text-sm wrap-anywhere text-ink-muted">
      {eventStatus[eventState(event, now)]} · {formatEventTime(event.startsAt, event.zone)} ·{" "}
      {event.participants.length} peserta
    </p>
  );
}

export function EventsView() {
  const data = useEvents();
  const now = useEventClock(1000);
  return (
    <BackShell back={{ href: HOME_HREF, label: "Beranda" }}>
      <h1 className="heading-lg">Event</h1>
      {data.status === "error" ? (
        <EventsError />
      ) : data.status === "loading" || now === null ? (
        <FeedItemSkeleton />
      ) : data.events.length === 0 ? (
        <EmptyState
          art="clouds"
          action={
            <ButtonLink variant="secondary" href={HOME_HREF}>
              Kembali ke Beranda
            </ButtonLink>
          }
        >
          Belum ada event.
        </EmptyState>
      ) : (
        <ul>
          {data.events
            .toSorted((a, b) => b.startsAt - a.startsAt)
            .map((event, index) => (
              <li
                key={event.id}
                className="rm-row-in min-w-0 border-b border-line"
                style={{ "--i": Math.min(index, 12) } as CSSProperties}
              >
                <Link
                  href={eventHref(event.id)}
                  className="group grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 py-5 no-underline md:gap-5"
                >
                  <DateLeaf
                    at={event.startsAt}
                    zone={event.zone}
                    className="transition-[translate,rotate] duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-3 motion-reduce:transition-none"
                  />
                  <span className="grid min-w-0 gap-1.5">
                    <h2 className="heading-md wrap-anywhere group-hover:underline group-hover:underline-offset-3">
                      {event.title}
                    </h2>
                    <EventSummary event={event} now={now} />
                    <span className="text-sm font-medium">{countdownLabel(event, now)}</span>
                    <p className="line-clamp-2 text-sm wrap-anywhere text-ink-soft">
                      {event.description}
                    </p>
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </BackShell>
  );
}
