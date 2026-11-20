import { describe, expect, it } from "vitest";
import { eventOf } from "@/features/notifications/notification-category";
import {
  DEFAULT_NOTIFICATION_PREFS,
  EVENT_INFO,
  NOTIFICATION_EVENTS,
  allowsInApp,
  mergeNotificationPrefs,
  parseNotificationPrefs,
} from "@/features/notifications/preferences";
import type { Notification } from "@/features/notifications/types";

const n = (over: Partial<Notification>): Notification => ({
  id: "x",
  kind: "project",
  actorId: null,
  others: 0,
  text: "",
  href: null,
  agoMs: 0,
  ...over,
});

describe("preferences", () => {
  it("start with everything on", () => {
    for (const e of NOTIFICATION_EVENTS)
      expect(DEFAULT_NOTIFICATION_PREFS[e]).toEqual({ app: true, email: true });
  });

  it("every event reaches the reader somewhere", () => {
    for (const e of NOTIFICATION_EVENTS)
      expect(EVENT_INFO[e].app || EVENT_INFO[e].email).toBe(true);
  });

  it("read broken data field by field", () => {
    const prefs = parseNotificationPrefs({
      comments: { app: false, email: "x" },
      follow: 3,
      nope: {},
    });
    expect(prefs.comments).toEqual({ app: false, email: true });
    expect(prefs.follow).toEqual({ app: true, email: true });
    expect(parseNotificationPrefs("junk")).toEqual(DEFAULT_NOTIFICATION_PREFS);
  });

  it("carry the two old email switches over", () => {
    const prefs = parseNotificationPrefs(undefined, { emailComments: false, emailProjects: false });
    expect(prefs.comments.email).toBe(false);
    expect(prefs.deadline.email).toBe(false);
    expect(prefs.classTask.email).toBe(false);
    expect(prefs.follow.email).toBe(true);
    // Stored per-event choices win over the old switches.
    expect(
      parseNotificationPrefs({ comments: { email: true } }, { emailComments: false }).comments
        .email,
    ).toBe(true);
  });

  it("merge a patch into one event and channel only", () => {
    const next = mergeNotificationPrefs(DEFAULT_NOTIFICATION_PREFS, { follow: { app: false } });
    expect(next.follow).toEqual({ app: false, email: true });
    expect(next.comments).toEqual({ app: true, email: true });
  });
});

describe("which event a notification belongs to", () => {
  it.each([
    [n({ kind: "comment" }), "comments"],
    [n({ kind: "reaction" }), "appreciation"],
    [n({ kind: "follow" }), "follow"],
    [n({ kind: "community", id: "editor-pick:p:1" }), "editorPick"],
    [n({ id: "staff-revision:w:1:2" }), "revisionSent"],
    [n({ id: "staff-mentor:w:1:1" }), "mentorHandIn"],
    [n({ id: "tugas-baru-t1" }), "classTask"],
    [n({ id: "tugas-a1-selesai-5" }), "classTask"],
  ])("%#", (notification, event) => expect(eventOf(notification)).toBe(event));

  it.each([
    "bayar-x-1-lunas",
    "sub-s1-diterima-1",
    "solo-1-layout-1",
    "lomba-x-pemenang",
    "ketentuan-x-v2",
    "staff-editor:w:initial",
    "mod-report:a:1",
    "mod-hidden:a:1",
    "unknown-thing",
  ])("%s is always sent", (id) =>
    expect(eventOf(n({ id, kind: id.startsWith("mod") ? "community" : "project" }))).toBeNull(),
  );

  it("lets mandatory notifications through even when everything optional is off", () => {
    const off = mergeNotificationPrefs(
      DEFAULT_NOTIFICATION_PREFS,
      Object.fromEntries(NOTIFICATION_EVENTS.map((e) => [e, { app: false }])),
    );
    expect(allowsInApp(off, null)).toBe(true);
    expect(allowsInApp(off, "comments")).toBe(false);
  });
});
