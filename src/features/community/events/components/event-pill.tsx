"use client";

import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { elapsed } from "../event-face";
import type { EventStateName, WritingEvent } from "../event-model";

/** The event's state as a small pill; only "in progress" is tinted with the accent. */
export function EventStatePill({ state }: { state: EventStateName }) {
  const t = useT().events.status;
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center rounded-full px-2.5 text-xs font-medium",
        state === "open" ? "bg-accent-subtle text-accent-ink" : "bg-subtle text-ink-muted",
      )}
    >
      {t[state]}
    </span>
  );
}

/** How much of the event has passed, as a thin accent line. Decorative: the countdown is text. */
export function EventTimeline({
  event,
  now,
}: {
  event: Pick<WritingEvent, "startsAt" | "endsAt">;
  now: number;
}) {
  return (
    <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-subtle">
      <i
        className="block h-full origin-left rounded-full bg-accent transition-[scale] duration-700"
        style={{ scale: `${elapsed(event, now)} 1` }}
      />
    </span>
  );
}
