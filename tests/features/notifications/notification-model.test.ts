import { describe, expect, it } from "vitest";
import { notificationFixtures } from "@/features/notifications/fixtures";
import { inTab, unreadCount, withReadState } from "@/features/notifications/notification-model";
import { agoLabel, leadOf } from "@/features/notifications/notification-text";
import { authors } from "@/features/community/fixtures/authors";
import { resolveFixturePosts } from "@/features/community/post-model";

const none = new Set<string>();

describe("withReadState and unreadCount", () => {
  it("counts the notifications that were neither seen before nor read on this device", () => {
    expect(unreadCount(withReadState(notificationFixtures, none))).toBe(3);
    expect(unreadCount(withReadState(notificationFixtures, new Set(["n-apresiasi"])))).toBe(2);
  });

  it("ignores ids that are not notifications", () => {
    expect(unreadCount(withReadState(notificationFixtures, new Set(["tidak-ada"])))).toBe(3);
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

  it("only link to posts and profiles that exist", () => {
    const ids = new Set(resolveFixturePosts(Date.now()).map((p) => p.id));
    const handles = new Set(authors.map((a) => a.handle));
    for (const n of notificationFixtures.filter((x) => x.href)) {
      const href = n.href!;
      if (href.startsWith("/postingan/"))
        expect(ids.has(href.replace("/postingan/", ""))).toBe(true);
      else expect(handles.has(href.replace("/penulis/", ""))).toBe(true);
    }
  });
});

describe("leadOf", () => {
  it("names the actor and folds the others into one line (PRD section 20)", () => {
    const merged = notificationFixtures.find((n) => n.id === "n-apresiasi")!;
    expect(leadOf(merged)).toBe("Hafiz Rahman dan 11 orang lain");
  });

  it("has no lead for events that come from the platform", () => {
    expect(leadOf(notificationFixtures.find((n) => n.id === "n-pembayaran")!)).toBeNull();
  });
});

describe("agoLabel", () => {
  const now = new Date(2026, 10, 15, 12).getTime();
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const ago = (agoMs: number) => ({ ...notificationFixtures[0], agoMs });

  it("adds 'lalu' to counted units only", () => {
    expect(agoLabel(ago(25 * MINUTE), now)).toBe("25 menit lalu");
    expect(agoLabel(ago(3 * HOUR), now)).toBe("3 jam lalu");
    expect(agoLabel(ago(26 * HOUR), now)).toBe("kemarin");
    expect(agoLabel(ago(3 * 24 * HOUR), now)).toBe("3 hari lalu");
    expect(agoLabel(ago(10 * 60 * 24 * MINUTE), now)).toBe("5 Nov");
  });
});
