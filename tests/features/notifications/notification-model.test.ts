import { describe, expect, it } from "vitest";
import { notificationFixtures } from "@/features/notifications/fixtures";
import { inTab, unreadCount, withReadState } from "@/features/notifications/notification-model";
import { agoLabel, leadOf } from "@/features/notifications/notification-text";
import { resolveFixturePosts } from "@/features/community/post-model";

const none = new Set<string>();

describe("withReadState and unreadCount", () => {
  it("counts the notifications that were neither seen before nor read on this device", () => {
    expect(unreadCount(withReadState(notificationFixtures, none))).toBe(4);
    expect(unreadCount(withReadState(notificationFixtures, new Set(["n-revisi"])))).toBe(3);
  });

  it("ignores ids that are not notifications", () => {
    expect(unreadCount(withReadState(notificationFixtures, new Set(["tidak-ada"])))).toBe(4);
  });
});

describe("inTab", () => {
  const all = withReadState(notificationFixtures, none);

  it("shows everything on Semua, in the order given", () => {
    expect(inTab(all, "semua").map((n) => n.id)).toEqual(all.map((n) => n.id));
  });

  it("shows only comments on Komentar and only project events on Proyek", () => {
    expect(new Set(inTab(all, "komentar").map((n) => n.kind))).toEqual(new Set(["comment"]));
    expect(new Set(inTab(all, "proyek").map((n) => n.kind))).toEqual(new Set(["project"]));
    expect(inTab(all, "komentar").length).toBeGreaterThan(0);
    expect(inTab(all, "proyek").length).toBeGreaterThan(0);
  });

  it("leaves reactions and follows for Semua only", () => {
    const others = all.filter((n) => n.kind === "reaction" || n.kind === "follow");
    expect(others.length).toBeGreaterThan(0);
    for (const n of others) {
      expect(inTab(all, "komentar")).not.toContain(n);
      expect(inTab(all, "proyek")).not.toContain(n);
    }
  });
});

describe("fixtures", () => {
  it("are listed newest first", () => {
    const times = notificationFixtures.map((n) => n.agoMs);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("only link to posts that exist", () => {
    const ids = new Set(resolveFixturePosts(Date.now()).map((p) => p.id));
    for (const n of notificationFixtures.filter((x) => x.href)) {
      expect(ids.has(n.href!.replace("/postingan/", ""))).toBe(true);
    }
  });
});

describe("leadOf", () => {
  it("names the actor and folds the others into one line (PRD section 20)", () => {
    const merged = notificationFixtures.find((n) => n.id === "n-apresiasi")!;
    expect(leadOf(merged)).toBe("Hafiz Rahman dan 11 orang lain");
  });

  it("has no lead for events that come from the platform", () => {
    expect(leadOf(notificationFixtures.find((n) => n.id === "n-revisi")!)).toBeNull();
  });
});

describe("agoLabel", () => {
  const now = new Date(2026, 10, 15, 12).getTime();
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;

  it("adds 'lalu' to counted units only", () => {
    expect(agoLabel(25 * MINUTE, now)).toBe("25 menit lalu");
    expect(agoLabel(3 * HOUR, now)).toBe("3 jam lalu");
    expect(agoLabel(26 * HOUR, now)).toBe("kemarin");
    expect(agoLabel(3 * 24 * HOUR, now)).toBe("3 hari lalu");
    expect(agoLabel(10 * 60 * 24 * MINUTE, now)).toBe("5 Nov");
  });
});
