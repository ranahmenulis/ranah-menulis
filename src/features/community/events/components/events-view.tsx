"use client";

import Link from "next/link";
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
import { refreshEvents, useEvents } from "../event-store";
import { useEventClock } from "../use-event-clock";

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
          action={
            <ButtonLink variant="secondary" href={HOME_HREF}>
              Kembali ke Beranda
            </ButtonLink>
          }
        >
          Belum ada event.
        </EmptyState>
      ) : (
        <ul className="grid gap-4">
          {data.events
            .toSorted((a, b) => b.startsAt - a.startsAt)
            .map((event) => (
              <li key={event.id} className="min-w-0">
                <Link
                  href={eventHref(event.id)}
                  className="grid gap-2 border border-line p-5 no-underline hover:bg-subtle"
                >
                  <h2 className="heading-md wrap-anywhere">{event.title}</h2>
                  <EventSummary event={event} now={now} />
                  <p className="line-clamp-2 text-sm wrap-anywhere">{event.description}</p>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </BackShell>
  );
}
