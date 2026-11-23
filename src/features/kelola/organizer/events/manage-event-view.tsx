"use client";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState, FeedItemSkeleton, Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { useT } from "@/lib/i18n/provider";
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

export function ManageEventsView() {
  const t = useT().kelolaOrganizerEvents;
  const roles = useEffectiveRoles();
  const data = useEvents();
  const now = useEventClock(1000);
  const allowed = canManageEvent(roles);
  const events =
    data.status === "ready" ? data.events.filter((event) => canManageEvent(roles, event)) : [];
  return (
    <BackShell back={{ href: ORGANIZER_HREF, label: t.backToProjects }}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="heading-lg">{t.list.title}</h1>
        {allowed && <ButtonLink href={NEW_EVENT_HREF}>{t.list.create}</ButtonLink>}
      </header>
      {data.status === "loading" || now === null ? (
        <FeedItemSkeleton />
      ) : !allowed ? (
        <Notice>{t.denied}</Notice>
      ) : data.status === "error" ? (
        <EventsError />
      ) : events.length === 0 ? (
        <EmptyState>{t.list.empty}</EmptyState>
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
  const t = useT().kelolaOrganizerEvents;
  const denied = <Notice>{t.denied}</Notice>;
  const roles = useEffectiveRoles();
  const data = useEvents();
  const now = useEventClock(1000);
  const event = data.status === "ready" ? data.events.find((item) => item.id === id) : undefined;

  function content() {
    if (data.status === "loading" || now === null) return <FeedItemSkeleton />;
    if (!canManageEvent(roles)) return denied;
    if (data.status === "error") return <EventsError />;
    if (id && !event) return <Notice>{t.detail.missing}</Notice>;
    if (!canManageEvent(roles, event)) return denied;
    return (
      <>
        {event && <TextLink href={eventHref(event.id)}>{t.detail.view}</TextLink>}
        <EventForm key={id ?? "new"} event={event} now={now} />
      </>
    );
  }
  return (
    <BackShell back={{ href: MANAGE_EVENTS_HREF, label: t.backToEvents }}>
      <h1 className="heading-lg">{id ? t.detail.titleEdit : t.detail.titleNew}</h1>
      {content()}
    </BackShell>
  );
}
