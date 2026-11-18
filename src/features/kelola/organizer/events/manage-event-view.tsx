"use client";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState, FeedItemSkeleton, Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { EventSummary, EventsError } from "@/features/community/events/components/events-view";
import { eventHref } from "@/features/community/events/event-model";
import { useEvents } from "@/features/community/events/event-store";
import { useEventClock } from "@/features/community/events/use-event-clock";
import { BackShell } from "@/features/kelola/components/back-shell";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { ORGANIZER_HREF } from "../area-hrefs";
import {
  canManageEvent,
  MANAGE_EVENTS_HREF,
  manageEventHref,
  NEW_EVENT_HREF,
} from "./event-access";
import { EventForm } from "./event-form";

const eventBack = { href: MANAGE_EVENTS_HREF, label: "Kelola Event" };
const denied = <Notice>Kamu tidak punya akses untuk mengelola event ini.</Notice>;

export function ManageEventsView() {
  const roles = useEffectiveRoles();
  const data = useEvents();
  const now = useEventClock(1000);
  const allowed = canManageEvent(roles);
  const events =
    data.status === "ready" ? data.events.filter((event) => canManageEvent(roles, event)) : [];
  return (
    <BackShell back={{ href: ORGANIZER_HREF, label: "Proyek Organizer" }}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="heading-lg">Kelola Event</h1>
        {allowed && <ButtonLink href={NEW_EVENT_HREF}>Buat event</ButtonLink>}
      </header>
      {data.status === "loading" || now === null ? (
        <FeedItemSkeleton />
      ) : !allowed ? (
        denied
      ) : data.status === "error" ? (
        <EventsError />
      ) : events.length === 0 ? (
        <EmptyState>Belum ada event yang kamu kelola.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {events.map((event) => (
            <li className="grid gap-1 py-4" key={event.id}>
              <TextLink href={manageEventHref(event.id)} className="font-medium wrap-anywhere">
                {event.title}
              </TextLink>
              <EventSummary event={event} now={now} />
            </li>
          ))}
        </ul>
      )}
    </BackShell>
  );
}

export function ManageEventView({ id }: { id?: string }) {
  const roles = useEffectiveRoles();
  const data = useEvents();
  const now = useEventClock(1000);
  const event = data.status === "ready" ? data.events.find((item) => item.id === id) : undefined;

  function content() {
    if (data.status === "loading" || now === null) return <FeedItemSkeleton />;
    if (!canManageEvent(roles)) return denied;
    if (data.status === "error") return <EventsError />;
    if (id && !event) return <Notice>Event ini tidak tersedia.</Notice>;
    if (!canManageEvent(roles, event)) return denied;
    return (
      <>
        {event && <TextLink href={eventHref(event.id)}>Lihat halaman event</TextLink>}
        <EventForm key={id ?? "new"} event={event} now={now} />
      </>
    );
  }
  return (
    <BackShell back={eventBack}>
      <h1 className="heading-lg">{id ? "Ubah event" : "Buat event"}</h1>
      {content()}
    </BackShell>
  );
}
