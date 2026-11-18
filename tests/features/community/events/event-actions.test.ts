import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  beginEventSprint,
  joinEvent,
  leaveEvent,
  recordEventSave,
} from "@/features/community/events/event-actions";
import { entryOf, eventState } from "@/features/community/events/event-model";
import { withEvents, writeEvent } from "@/features/community/events/event-store";
import { ME_ID } from "@/features/kelola/identity";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { setViewer } from "@/lib/viewer";

const id = "cerita-selama-sepekan";
const current = () => withEvents((events) => events.find((event) => event.id === id)!);
const start = Date.parse("2026-11-18T12:00:00+07:00");
const sprintStart = Date.parse("2026-11-18T19:00:00+07:00");
const sprintEnd = sprintStart + 30 * 60_000;
const doc: StudioDocument = {
  id: "doc-event",
  title: "Surat",
  content: { type: "doc" },
  version: 3,
  updatedAt: start - 1,
  wordCount: 30,
};
const documentStore = { get: vi.fn(async () => doc) };

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  documentStore.get.mockClear();
});
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe("event participation", () => {
  it("does not hold event writes while Studio is still loading a document", async () => {
    const read = Promise.withResolvers<StudioDocument>();
    const get = vi.fn(() => read.promise);
    const joining = joinEvent(id, doc.id, { get }, () => start);
    await vi.waitFor(() => expect(get).toHaveBeenCalledOnce());
    try {
      await withEvents((events) => writeEvent(events, { ...events[0], capacity: 2 }));
    } finally {
      read.resolve(doc);
    }
    expect(await joining).toMatchObject({
      ok: false,
      message: expect.stringContaining("Kuota penuh"),
    });
  });

  it("serializes concurrent joins and frees a seat without deleting the document", async () => {
    await withEvents((events) => writeEvent(events, { ...events[0], capacity: 3 }));
    const results = await Promise.all([
      joinEvent(id, doc.id, documentStore, () => start),
      joinEvent(id, doc.id, documentStore, () => start),
    ]);
    expect(results.map(({ ok }) => ok)).toEqual([true, false]);
    const event = await current();
    expect(eventState(event, start)).toBe("full");
    const first = entryOf(event, ME_ID)!;
    expect(first).toMatchObject({ documentId: doc.id, baseline: 30, words: 0 });
    expect(await leaveEvent(id, first.id)).toMatchObject({ ok: true });
    expect(eventState(await current(), start)).toBe("open");
    expect(await joinEvent(id, doc.id, documentStore, () => start)).toMatchObject({ ok: true });
    expect(await leaveEvent(id, first.id)).toMatchObject({ ok: false });
    expect(entryOf(await current(), ME_ID)?.words).toBe(0);
  });

  it("checks the real deadline and current account after loading the selected document", async () => {
    const event = await current();
    expect(await joinEvent(id, doc.id, documentStore, () => event.startsAt - 1)).toMatchObject({
      ok: false,
      message: expect.stringContaining("Akan datang"),
    });
    expect(await joinEvent(id, doc.id, documentStore, () => event.endsAt)).toMatchObject({
      ok: false,
      message: expect.stringContaining("Selesai"),
    });
    const changed = {
      get: async () => {
        setViewer("tamu");
        return doc;
      },
    };
    expect(await joinEvent(id, doc.id, changed, () => start)).toMatchObject({ ok: false });
    expect(await joinEvent(id, doc.id, documentStore, () => start)).toMatchObject({ ok: false });
    expect(entryOf(await current(), ME_ID)).toBeNull();
  });

  it("keeps the previous registration when reading the document or writing storage fails", async () => {
    const missing = { get: async () => ({ ...doc, deletedAt: start }) };
    expect(await joinEvent(id, doc.id, missing, () => start)).toMatchObject({ ok: false });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(await joinEvent(id, doc.id, documentStore, () => start)).toMatchObject({ ok: false });
    expect(entryOf(await current(), ME_ID)).toBeNull();
  });

  it("uses the shared end time and freezes private sprint and event progress independently", async () => {
    await joinEvent(id, doc.id, documentStore, () => start);
    const registration = entryOf(await current(), ME_ID)!;
    const late = sprintStart + 20 * 60_000;
    expect(await beginEventSprint(id, registration.id, documentStore, () => late)).toMatchObject({
      ok: true,
    });
    expect(
      await beginEventSprint(id, registration.id, documentStore, () => sprintEnd),
    ).toMatchObject({ ok: false });
    await recordEventSave({ ...doc, version: 5, updatedAt: sprintEnd, wordCount: 90 });
    await recordEventSave({ ...doc, version: 4, updatedAt: late + 1, wordCount: 42 });
    await recordEventSave({ ...doc, version: 8, updatedAt: late + 2, wordCount: 100, id: "other" });
    await recordEventSave({
      ...doc,
      version: 6,
      updatedAt: (await current()).endsAt,
      wordCount: 110,
    });
    expect(entryOf(await current(), ME_ID)).toMatchObject({
      version: 5,
      words: 60,
      sprint: { joinedAt: late, version: 4, words: 12 },
    });
  });
});
