import { ME_ID } from "@/features/kelola/identity";
import type { DocumentStore, StudioDocument } from "@/features/studio/storage/document-store";
import { readGroupReader } from "../groups/group-viewer";
import { entryAfterSave, entryOf, eventState, eventStatus, type EventEntry } from "./event-model";
import { withEvents, writeEvent, writeEvents } from "./event-store";

const inactive = "Akun aktif diperlukan untuk mengikuti event.";
const unavailable = "Event ini tidak tersedia.";
const missingDocument = "Dokumen itu tidak bisa dipakai. Pilih dokumen Studio yang tersedia.";
const storageError = "Perubahan belum tersimpan di perangkat ini. Coba lagi.";

type Result = { ok: true; message: string } | { ok: false; message: string };
const fail = (message: string): Result => ({ ok: false, message });
const done = (message: string): Result => ({ ok: true, message });

export async function joinEvent(
  id: string,
  documentId: string,
  store: Pick<DocumentStore, "get">,
  clock = Date.now,
): Promise<Result> {
  const actor = readGroupReader();
  if (!actor) return fail(inactive);
  try {
    return await withEvents(async (events) => {
      const doc = await store.get(documentId);
      const now = clock();
      if (readGroupReader() !== actor) return fail(inactive);
      const event = events.find((item) => item.id === id);
      if (!event) return fail(unavailable);
      if (event.participants.some((participant) => participant.authorId === actor)) {
        return fail("Kamu sudah terdaftar di event ini.");
      }
      const state = eventState(event, now);
      if (state !== "open") return fail(`Pendaftaran tidak tersedia. ${eventStatus[state]}.`);
      if (!doc || doc.deletedAt != null) return fail(missingDocument);
      const entry: EventEntry = {
        id: crypto.randomUUID(),
        documentId: doc.id,
        joinedAt: now,
        baseline: doc.wordCount,
        version: doc.version,
        words: 0,
        sprint: null,
      };
      writeEvent(events, {
        ...event,
        scheduleLocked: true,
        participants: [...event.participants, { authorId: actor, entry }],
      });
      return done("Kamu bergabung dengan event.");
    });
  } catch {
    return fail(storageError);
  }
}

export async function leaveEvent(id: string, entryId: string): Promise<Result> {
  try {
    return await withEvents((events) => {
      const actor = readGroupReader();
      if (!actor) return fail(inactive);
      const event = events.find((item) => item.id === id);
      if (!event) return fail(unavailable);
      if (entryOf(event, actor)?.id !== entryId) {
        return fail("Pendaftaran sudah berubah. Periksa status event dan coba lagi.");
      }
      writeEvent(events, {
        ...event,
        participants: event.participants.filter(({ authorId }) => authorId !== actor),
      });
      return done("Kamu keluar dari event.");
    });
  } catch {
    return fail(storageError);
  }
}

export async function beginEventSprint(
  id: string,
  entryId: string,
  store: Pick<DocumentStore, "get">,
  clock = Date.now,
): Promise<Result> {
  try {
    return await withEvents(async (events) => {
      const actor = readGroupReader();
      if (!actor) return fail(inactive);
      const event = events.find((item) => item.id === id);
      const entry = event && entryOf(event, actor);
      if (!event?.sprint || entry?.id !== entryId) return fail("Sesi sprint tidak tersedia.");
      const doc = await store.get(entry.documentId);
      const now = clock();
      if (readGroupReader() !== actor) return fail(inactive);
      if (now < event.sprint.startsAt || now >= event.sprint.endsAt) {
        return fail("Sesi sprint sedang tidak berlangsung.");
      }
      if (!doc || doc.deletedAt != null) return fail(missingDocument);
      if (entry.sprint) return done("Sesi sprint sudah diikuti.");
      const next = {
        ...entry,
        sprint: { joinedAt: now, baseline: doc.wordCount, version: doc.version, words: 0 },
      };
      writeEvent(events, {
        ...event,
        participants: event.participants.map((participant) =>
          participant.authorId === actor ? { authorId: actor, entry: next } : participant,
        ),
      });
      return done("Kamu bergabung dengan sprint.");
    });
  } catch {
    return fail(storageError);
  }
}

/** Called after Studio commits a save; the event side never modifies the document. */
export function recordEventSave(doc: StudioDocument) {
  if (readGroupReader() !== ME_ID || doc.deletedAt != null) return Promise.resolve();
  return withEvents((events) => {
    if (readGroupReader() !== ME_ID) return;
    let changed = false;
    const next = events.map((event) => {
      const entry = entryOf(event, ME_ID);
      const updated = entry && entryAfterSave(event, entry, doc);
      if (!updated || updated === entry) return event;
      changed = true;
      return {
        ...event,
        participants: event.participants.map((participant) =>
          participant.authorId === ME_ID ? { authorId: ME_ID, entry: updated } : participant,
        ),
      };
    });
    if (changed) writeEvents(next);
  });
}
