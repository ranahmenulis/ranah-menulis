import { zoneIana } from "@/features/projects/project-model";
import type { TimeZoneName } from "@/features/projects/types";
import { sprintWords } from "@/features/studio/sprint";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { groupsFor, type WritingGroup } from "../groups/group-model";

export const EVENTS_HREF = "/event";
export const eventHref = (id: string) => `${EVENTS_HREF}/${encodeURIComponent(id)}`;
export const eventStudioHref = (id: string, documentId: string) =>
  `/studio/${encodeURIComponent(documentId)}?event=${encodeURIComponent(id)}`;

export type EventSprint = { startsAt: number; endsAt: number };

export type EventSettings = {
  title: string;
  description: string;
  rules: string;
  startsAt: number;
  endsAt: number;
  zone: TimeZoneName;
  target: number;
  capacity: number | null;
  sprint: EventSprint | null;
};

export type EventEntry = {
  id: string;
  documentId: string;
  joinedAt: number;
  baseline: number;
  version: number;
  words: number;
  sprint: { joinedAt: number; baseline: number; version: number; words: number } | null;
};

export type EventParticipant = { authorId: string; entry: EventEntry | null };
export type WritingEvent = EventSettings & {
  id: string;
  ownerId: string;
  revision: number;
  scheduleLocked: boolean;
  participants: EventParticipant[];
};

type EventState = "upcoming" | "open" | "full" | "finished";

export function eventState(event: WritingEvent, now: number): EventState {
  if (now < event.startsAt) return "upcoming";
  if (now >= event.endsAt) return "finished";
  return event.capacity !== null && event.participants.length >= event.capacity ? "full" : "open";
}

export const eventStatus: Record<EventState, string> = {
  upcoming: "Akan datang",
  open: "Sedang berlangsung",
  full: "Kuota penuh",
  finished: "Selesai",
};

export function entryOf(event: WritingEvent, authorId: string | null) {
  return event.participants.find((participant) => participant.authorId === authorId)?.entry ?? null;
}

export function visibleParticipantIds(
  participants: readonly EventParticipant[],
  groups: readonly WritingGroup[],
  viewer: string | null,
) {
  const peers = new Set(
    groupsFor(groups, viewer).flatMap((group) => group.members.map((m) => m.authorId)),
  );
  return participants
    .filter(({ authorId }) => authorId !== viewer && peers.has(authorId))
    .map(({ authorId }) => authorId);
}

export function formatEventTime(timestamp: number, zone: TimeZoneName) {
  return `${new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: zoneIana(zone),
  }).format(timestamp)} ${zone}`;
}

/** Progress is derived solely from accepted saves inside the participation window. */
export function entryAfterSave(
  event: WritingEvent,
  entry: EventEntry,
  doc: Pick<StudioDocument, "id" | "version" | "updatedAt" | "wordCount">,
): EventEntry {
  if (doc.id !== entry.documentId) return entry;
  if (doc.updatedAt < entry.joinedAt || doc.updatedAt >= event.endsAt) return entry;
  const { sprint } = entry;
  const sprintActive =
    sprint &&
    event.sprint &&
    doc.version > sprint.version &&
    doc.updatedAt >= sprint.joinedAt &&
    doc.updatedAt < event.sprint.endsAt;
  const newer = doc.version > entry.version;
  if (!newer && !sprintActive) return entry;
  return {
    ...entry,
    version: newer ? doc.version : entry.version,
    words: newer ? sprintWords(entry.baseline, doc.wordCount) : entry.words,
    sprint: sprintActive
      ? { ...sprint, version: doc.version, words: sprintWords(sprint.baseline, doc.wordCount) }
      : sprint,
  };
}
