"use client";

import { Button } from "@/components/ui/button";
import { formatRemaining } from "@/features/studio/sprint";
import { useGroupReader } from "../../groups/group-viewer";
import { entryOf, eventHref } from "../event-model";
import { useEvents } from "../event-store";
import { useEventClock } from "../use-event-clock";

export function EventEditorPanel({
  eventId,
  documentId,
  onBack,
}: {
  eventId: string;
  documentId: string;
  onBack: (href: string) => void;
}) {
  const actor = useGroupReader();
  const data = useEvents();
  const now = useEventClock(250);
  const event = data.status === "ready" ? data.events.find(({ id }) => id === eventId) : undefined;
  const entry = event && entryOf(event, actor);
  if (!event || entry?.documentId !== documentId) return null;
  const session = event.sprint;
  const result = entry.sprint;
  const hasSprint = session && result && now !== null;
  const running = hasSprint && now < session.endsAt;
  return (
    <div className="border-b border-line bg-canvas px-4 md:px-6">
      <div className="mx-auto flex max-w-170 flex-wrap items-center justify-between gap-x-4 py-1">
        <Button variant="text" size="sm" onClick={() => onBack(eventHref(event.id))}>
          Kembali ke event
        </Button>
        {running && (
          <p className="text-sm tabular-nums">
            Sprint bersama · <time>{formatRemaining(session.endsAt - now)}</time>
          </p>
        )}
        {hasSprint && !running && (
          <p role="status" className="text-sm">
            Sprint selesai · {result.words.toLocaleString("id-ID")} kata
          </p>
        )}
      </div>
    </div>
  );
}
