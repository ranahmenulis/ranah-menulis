"use client";

import { ListChecks, Timer, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section-card";
import { FeedItemSkeleton, Notice } from "@/components/ui/states";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { CommunityLink } from "@/features/app-shell/community-link";
import { BackShell } from "@/features/kelola/components/back-shell";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { writingGroups } from "../../groups/group-store";
import { useGroupReader } from "../../groups/group-viewer";
import { AuthorAvatar } from "../../components/author-avatar";
import { authorOf } from "../../post-model";
import {
  entryOf,
  EVENTS_HREF,
  eventState,
  formatEventTime,
  type EventStateName,
  visibleParticipantIds,
  type WritingEvent,
} from "../event-model";
import { useEvents } from "../event-store";
import { useEventClock } from "../use-event-clock";
import { EventHero } from "./event-hero";
import { EventJoin } from "./event-join";
import { EventParticipation } from "./event-participation";
import { EventsError } from "./events-view";

/** Joining, for someone who is not in the event yet: the button, a sign-in, or why not. */
function JoinArea({
  state,
  actor,
  guest,
  onJoin,
}: {
  state: EventStateName;
  actor: string | null;
  guest: boolean;
  onJoin: () => void;
}) {
  const t = useT().events;
  return (
    <div className="grid justify-items-start gap-3">
      {state !== "open" ? (
        <>
          <Button disabled>{t.detail.join}</Button>
          <p className="text-sm text-ink-muted">
            {format(t.detail.closed, { status: t.status[state] })}
          </p>
        </>
      ) : actor ? (
        <Button onClick={onJoin}>{t.detail.join}</Button>
      ) : guest ? (
        <SignInButton>{t.detail.signInToJoin}</SignInButton>
      ) : (
        <Notice>{t.detail.needAccount}</Notice>
      )}
    </div>
  );
}

function EventDetail({
  event,
  now,
  store,
}: {
  event: WritingEvent;
  now: number;
  store: DocumentStore;
}) {
  const t = useT().events;
  const locale = useLocale();
  const groups = writingGroups.use();
  const actor = useGroupReader();
  const guest = useViewer() === "tamu";
  const entry = entryOf(event, actor);
  const [message, setMessage] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [join, setJoin] = useState(false);
  if (join && (entry || !actor)) setJoin(false);
  const state = eventState(event, now);
  const participants = visibleParticipantIds(event.participants, groups, actor);
  const { sprint, zone } = event;

  useEffect(() => {
    if (!message) return;
    // Wait for the status line to render and the native dialog to release focus.
    const frame = requestAnimationFrame(() => statusRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [message]);
  return (
    <>
      <EventHero event={event} now={now} state={state} />
      <p className="text-base wrap-anywhere whitespace-pre-line text-ink-soft md:text-lg">
        {event.description}
      </p>
      <p role="status" tabIndex={-1} ref={statusRef} className="empty:hidden">
        {message}
      </p>
      {entry ? (
        <EventParticipation
          key={entry.id}
          event={event}
          entry={entry}
          now={now}
          store={store}
          show={setMessage}
        />
      ) : (
        <JoinArea state={state} actor={actor} guest={guest} onJoin={() => setJoin(true)} />
      )}
      <Section title={t.detail.rulesTitle} icon={ListChecks} className="gap-2">
        <p className="text-sm font-medium">
          {format(t.detail.target, {
            words: event.target.toLocaleString(locale === "en" ? "en-US" : "id-ID"),
          })}
        </p>
        <p className="wrap-anywhere whitespace-pre-line">{event.rules}</p>
      </Section>
      {sprint && (
        <Section title={t.detail.sprintTitle} icon={Timer} className="gap-2">
          <p className="text-sm">
            {formatEventTime(sprint.startsAt, zone, locale)} –{" "}
            {formatEventTime(sprint.endsAt, zone, locale)}
          </p>
          <p className="text-sm text-ink-muted">
            {now < sprint.startsAt
              ? t.detail.sprintScheduled
              : now < sprint.endsAt
                ? t.detail.sprintRunning
                : t.detail.sprintOver}
          </p>
        </Section>
      )}
      {participants.length > 0 && (
        <Section title={t.detail.peersTitle} icon={UsersThree} className="gap-2">
          <ul className="divide-y divide-line">
            {participants.map((id) => (
              <li key={id} className="flex items-center gap-3 py-2.5">
                <AuthorAvatar author={authorOf(id)} size={32} />
                {authorOf(id).name}
              </li>
            ))}
          </ul>
        </Section>
      )}
      <CommunityLink variant="row" />
      {join && actor && !entry && (
        <EventJoin
          eventId={event.id}
          store={store}
          close={() => setJoin(false)}
          joined={setMessage}
        />
      )}
    </>
  );
}

export function EventView({ id, store = studioStore }: { id: string; store?: DocumentStore }) {
  const t = useT().events.detail;
  const data = useEvents();
  const now = useEventClock(1000);
  const event = data.status === "ready" ? data.events.find((item) => item.id === id) : undefined;
  return (
    <BackShell back={{ href: EVENTS_HREF, label: t.allEvents }}>
      {data.status === "error" ? (
        <EventsError />
      ) : data.status === "loading" || now === null ? (
        <FeedItemSkeleton />
      ) : event ? (
        <EventDetail key={id} event={event} now={now} store={store} />
      ) : (
        <>
          <h1 className="heading-lg">{t.notFoundTitle}</h1>
          <Notice>{t.notFoundBody}</Notice>
        </>
      )}
    </BackShell>
  );
}
