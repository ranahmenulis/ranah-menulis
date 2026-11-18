import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { withEvents, writeEvent } from "@/features/community/events/event-store";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { logRows } from "@/features/kelola/audit/audit-model";
import {
  inputOf,
  buildEvent,
  type EventInput,
} from "@/features/kelola/organizer/events/event-input";
import { saveWritingEvent } from "@/features/kelola/organizer/events/manage-event-actions";

const input: EventInput = {
  title: "Setengah Jam Cerita",
  description: "Menulis satu adegan.",
  rules: "Pakai Studio.",
  zone: "MYT",
  start: "2026-11-18T07:00",
  end: "2026-11-19T21:00",
  target: "500",
  capacity: "2",
  sprintStart: "2026-11-18T19:00",
  sprintMinutes: "30",
};
const now = () => Date.parse("2026-11-18T13:00:00+08:00");

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  auditLog.reset();
});
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  auditLog.reset();
});

describe("event management", () => {
  it("rejects a stale timezone change even when the sprint instant would remain the same", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    const seed = await withEvents((events) => events[0]);
    const event = { ...seed, scheduleLocked: false, participants: [] };
    await withEvents((events) => writeEvent(events, event));
    const changed = inputOf({ ...event, zone: "MYT" });
    expect(await saveWritingEvent(changed, event, () => event.sprint!.startsAt)).toMatchObject({
      ok: false,
      message: expect.stringContaining("zona waktu terkunci"),
    });
    expect(auditLog.read()).toHaveLength(0);
  });

  it("validates a real local datetime and keeps the complete sprint inside the event", () => {
    expect(buildEvent({ ...input, start: "2026-11-31T07:00" })).toMatchObject({
      ok: false,
      errors: { start: expect.any(String) },
    });
    expect(buildEvent({ ...input, sprintStart: "2026-11-19T20:45" })).toMatchObject({
      ok: false,
      errors: { sprintStart: expect.any(String) },
    });
    expect(buildEvent({ ...input, target: "0", capacity: "1.5" })).toMatchObject({
      ok: false,
      errors: { target: expect.any(String), capacity: expect.any(String) },
    });
    expect(buildEvent(input)).toMatchObject({
      ok: true,
      settings: { startsAt: Date.parse("2026-11-18T07:00:00+08:00") },
    });
  });

  it("checks the role and ownership at write time and records management changes", async () => {
    const seed = await withEvents((events) => events[0]);
    expect(await saveWritingEvent(input, undefined, now)).toMatchObject({ ok: false });
    sessionStorage.setItem("rm-roles", "organizer");
    expect(await saveWritingEvent(inputOf(seed), seed, now)).toMatchObject({ ok: false });
    const created = await saveWritingEvent(input, undefined, now);
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error(created.message);
    expect(
      await saveWritingEvent({ ...input, title: "Jendela Cerita" }, created, now),
    ).toMatchObject({ ok: true, revision: 2 });
    expect(await saveWritingEvent(input, created, now)).toMatchObject({ ok: false });
    sessionStorage.setItem("rm-roles", "administrator");
    expect(
      await saveWritingEvent({ ...inputOf(seed), title: "Cerita Pekan Ini" }, seed, now),
    ).toMatchObject({ ok: true });
    const entries = logRows(auditLog.read(), [], "event");
    expect(entries.map(({ action }) => action)).toEqual([
      "event.create",
      "event.update",
      "event.update",
    ]);
    expect(entries.every((entry) => !entry.targetId && entry.ref?.startsWith("event:"))).toBe(true);
  });

  it("rejects changes to locked times and targets, insufficient seats and a sprint already underway", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    const event = await withEvents((events) => events[0]);
    const fixed = inputOf(event);
    expect(await saveWritingEvent({ ...fixed, target: "10" }, event, now)).toMatchObject({
      ok: false,
    });
    expect(await saveWritingEvent({ ...fixed, capacity: "1" }, event, now)).toMatchObject({
      ok: false,
    });
    await withEvents((events) => writeEvent(events, { ...event, participants: [] }));
    expect(await saveWritingEvent({ ...fixed, target: "10" }, event, now)).toMatchObject({
      ok: false,
    });
    expect(
      await saveWritingEvent(
        { ...fixed, sprintMinutes: "40" },
        event,
        () => event.sprint!.startsAt,
      ),
    ).toMatchObject({ ok: false });
    expect(auditLog.read()).toHaveLength(0);
  });
});
