"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedItemSkeleton, Notice } from "@/components/ui/states";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { CommunityLink } from "@/features/app-shell/community-link";
import { BackShell } from "@/features/kelola/components/back-shell";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import { useViewer } from "@/lib/viewer";
import { writingGroups } from "../../groups/group-store";
import { useGroupReader } from "../../groups/group-viewer";
import { authorOf } from "../../post-model";
import {
  entryOf,
  EVENTS_HREF,
  eventState,
  eventStatus,
  formatEventTime,
  visibleParticipantIds,
  type WritingEvent,
} from "../event-model";
import { useEvents } from "../event-store";
import { useEventClock } from "../use-event-clock";
import { EventJoin } from "./event-join";
import { EventParticipation } from "./event-participation";
import { EventsError } from "./events-view";

function EventDetail({
  event,
  now,
  store,
}: {
  event: WritingEvent;
  now: number;
  store: DocumentStore;
}) {
  const groups = writingGroups.use();
  const actor = useGroupReader();
  const guest = useViewer() === "tamu";
  const entry = entryOf(event, actor);
  const [message, setMessage] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [join, setJoin] = useState(false);
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
      <header className="grid gap-2">
        <h1 className="heading-lg wrap-anywhere">{event.title}</h1>
        <p className="text-sm text-ink-muted">
          {eventStatus[state]} · {event.participants.length} peserta
        </p>
        <p className="text-sm text-ink-muted">
          {formatEventTime(event.startsAt, zone)} – {formatEventTime(event.endsAt, zone)}
        </p>
        <p className="mt-2 wrap-anywhere whitespace-pre-line">{event.description}</p>
      </header>
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
        <div className="grid justify-items-start gap-3">
          {state !== "open" ? (
            <>
              <Button disabled>Gabung</Button>
              <p className="text-sm text-ink-muted">
                Pendaftaran tidak tersedia. {eventStatus[state]}.
              </p>
            </>
          ) : actor ? (
            <Button onClick={() => setJoin(true)}>Gabung</Button>
          ) : guest ? (
            <SignInButton>Masuk untuk bergabung</SignInButton>
          ) : (
            <Notice>Akun aktif diperlukan untuk mengikuti event.</Notice>
          )}
        </div>
      )}
      <section className="grid gap-2 border-t border-line pt-6">
        <h2 className="heading-md">Aturan tantangan</h2>
        <p className="text-sm">Target {event.target.toLocaleString("id-ID")} kata</p>
        <p className="wrap-anywhere whitespace-pre-line">{event.rules}</p>
      </section>
      {sprint && (
        <section className="grid gap-2 border-t border-line pt-6">
          <h2 className="heading-md">Sprint bersama</h2>
          <p className="text-sm">
            {formatEventTime(sprint.startsAt, zone)} – {formatEventTime(sprint.endsAt, zone)}
          </p>
          <p className="text-sm text-ink-muted">
            {now < sprint.startsAt
              ? "Terjadwal"
              : now < sprint.endsAt
                ? "Sedang berlangsung"
                : "Sesi selesai"}
          </p>
        </section>
      )}
      {participants.length > 0 && (
        <section className="grid gap-2 border-t border-line pt-6">
          <h2 className="heading-md">Peserta dari grupmu</h2>
          <ul className="divide-y divide-line">
            {participants.map((id) => (
              <li key={id} className="py-2">
                {authorOf(id).name}
              </li>
            ))}
          </ul>
        </section>
      )}
      <CommunityLink variant="row" />
      {join && actor && (
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
  const data = useEvents();
  const now = useEventClock(1000);
  const event = data.status === "ready" ? data.events.find((item) => item.id === id) : undefined;
  return (
    <BackShell back={{ href: EVENTS_HREF, label: "Semua Event" }}>
      {data.status === "error" ? (
        <EventsError />
      ) : data.status === "loading" || now === null ? (
        <FeedItemSkeleton />
      ) : event ? (
        <EventDetail key={id} event={event} now={now} store={store} />
      ) : (
        <>
          <h1 className="heading-lg">Event tidak tersedia</h1>
          <Notice>Alamat ini tidak mengarah ke event yang tersedia.</Notice>
        </>
      )}
    </BackShell>
  );
}
