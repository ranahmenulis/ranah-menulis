"use client";

import { useSyncExternalStore } from "react";
import {
  entryOf,
  type EventEntry,
  type EventParticipant,
  type EventSprint,
  type WritingEvent,
} from "./event-model";

const KEY = "ranah.events";
const CHANGED = "ranah:events";
const unavailable = { status: "error" } as const;
const loading = { status: "loading" } as const;
type Ready = { status: "ready"; events: readonly WritingEvent[] };
type Read = Ready | typeof unavailable;

const seedStart = Date.parse("2026-11-18T00:00:00+07:00");
const seed: Ready = {
  status: "ready",
  events: [
    {
      id: "cerita-selama-sepekan",
      ownerId: "nur-aisyah",
      revision: 1,
      scheduleLocked: true,
      title: "Cerita Selama Sepekan",
      description: "Luangkan waktu setiap hari untuk menulis satu cerita sampai selesai.",
      rules: "Pilih satu dokumen Studio untuk tantangan ini. Kamu bebas menentukan tema ceritamu.",
      startsAt: seedStart,
      endsAt: seedStart + 7 * 86_400_000,
      zone: "WIB",
      target: 2000,
      capacity: null,
      sprint: {
        startsAt: seedStart + 19 * 3_600_000,
        endsAt: seedStart + 19.5 * 3_600_000,
      },
      participants: [
        { authorId: "hafiz-rahman", entry: null },
        { authorId: "maya-anindita", entry: null },
      ],
    },
  ],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isTime = (value: unknown): value is number =>
  isCount(value) && value <= 8_640_000_000_000_000 - 8 * 3_600_000;

function isSprint(value: unknown): value is EventSprint {
  return (
    isRecord(value) &&
    isTime(value.startsAt) &&
    isTime(value.endsAt) &&
    value.startsAt < value.endsAt
  );
}

function isEntry(value: unknown): value is EventEntry {
  if (!isRecord(value)) return false;
  const { id, documentId, joinedAt, baseline, version, words, sprint } = value;
  const validSprint =
    sprint === null ||
    (isRecord(sprint) &&
      isTime(sprint.joinedAt) &&
      isCount(sprint.baseline) &&
      isCount(sprint.words) &&
      isCount(sprint.version));
  return (
    typeof id === "string" &&
    typeof documentId === "string" &&
    isTime(joinedAt) &&
    isCount(baseline) &&
    isCount(version) &&
    isCount(words) &&
    validSprint
  );
}

function isParticipant(value: unknown): value is EventParticipant {
  return (
    isRecord(value) &&
    typeof value.authorId === "string" &&
    (value.entry === null || isEntry(value.entry))
  );
}

function hasEventSchedule({ startsAt, endsAt, zone, sprint }: Record<string, unknown>) {
  return (
    (zone === "WIB" || zone === "MYT") &&
    isTime(startsAt) &&
    isTime(endsAt) &&
    startsAt < endsAt &&
    (sprint === null ||
      (isSprint(sprint) && sprint.startsAt >= startsAt && sprint.endsAt <= endsAt))
  );
}

function isEvent(value: unknown): value is WritingEvent {
  if (!isRecord(value)) return false;
  const strings = ["id", "ownerId", "title", "description", "rules"];
  if (!strings.every((key) => typeof value[key] === "string")) return false;
  const { revision, target, capacity, participants } = value;
  return (
    hasEventSchedule(value) &&
    isCount(revision) &&
    typeof value.scheduleLocked === "boolean" &&
    isCount(target) &&
    target > 0 &&
    (capacity === null || (isCount(capacity) && capacity > 0)) &&
    Array.isArray(participants) &&
    participants.every(isParticipant)
  );
}

let cached: { raw: string; snapshot: Read } | undefined;

function read(): Read {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return seed;
    if (cached?.raw === raw) return cached.snapshot;
    const value: unknown = JSON.parse(raw);
    const snapshot =
      Array.isArray(value) && value.every(isEvent)
        ? { status: "ready" as const, events: value }
        : unavailable;
    cached = { raw, snapshot };
    return snapshot;
  } catch {
    return unavailable;
  }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === KEY || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED, listener);
  };
}

export function useEvents() {
  return useSyncExternalStore<Read | typeof loading>(subscribe, read, () => loading);
}

export function tracksEventDocument(authorId: string, documentId: string) {
  const snapshot = read();
  return snapshot.status === "ready"
    ? snapshot.events.some((event) => entryOf(event, authorId)?.documentId === documentId)
    : undefined;
}

export function refreshEvents() {
  window.dispatchEvent(new Event(CHANGED));
}

let pending: Promise<unknown> = Promise.resolve();

export function withEvents<T>(update: (events: readonly WritingEvent[]) => T): Promise<T> {
  function run() {
    const snapshot = read();
    if (snapshot.status === "error") throw new Error("Event data is unavailable");
    return update(snapshot.events);
  }
  // Serialize read/modify/write across tabs when Web Locks are available.
  if (navigator.locks) return navigator.locks.request(KEY, run);
  const result = pending.then(run);
  pending = result.catch(() => undefined);
  return result;
}

export function writeEvent(events: readonly WritingEvent[], event: WritingEvent) {
  const next = events.some((item) => item.id === event.id)
    ? events.map((item) => (item.id === event.id ? event : item))
    : [...events, event];
  writeEvents(next);
}

export function writeEvents(events: readonly WritingEvent[]) {
  window.localStorage.setItem(KEY, JSON.stringify(events));
  refreshEvents();
}
