import { describe, expect, it } from "vitest";
import { bucketOf, dayGroups } from "@/features/notifications/notification-days";
import type { NotificationView } from "@/features/notifications/notification-model";

const now = new Date(2026, 10, 21, 10, 0).getTime();
const HOUR = 60 * 60 * 1000;
const item = (id: string, agoMs: number) => ({ id, agoMs, read: false }) as NotificationView;

describe("bucketOf", () => {
  it("uses calendar days, not 24-hour spans", () => {
    expect(bucketOf(new Date(2026, 10, 21, 0, 5).getTime(), now)).toBe("today");
    expect(bucketOf(new Date(2026, 10, 20, 23, 55).getTime(), now)).toBe("yesterday");
    expect(bucketOf(new Date(2026, 10, 15, 12).getTime(), now)).toBe("week");
    expect(bucketOf(new Date(2026, 10, 14, 12).getTime(), now)).toBe("older");
  });
});

describe("dayGroups", () => {
  it("keeps the list order and groups each item once", () => {
    const groups = dayGroups(
      [item("a", HOUR), item("b", 2 * HOUR), item("c", 24 * HOUR), item("d", 30 * 24 * HOUR)],
      now,
    );
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ["Hari ini", ["a", "b"]],
      ["Kemarin", ["c"]],
      ["Lebih lama", ["d"]],
    ]);
  });

  it("prefers the absolute time when there is one", () => {
    const stored = { ...item("e", 0), at: now - 3 * 24 * HOUR };
    expect(dayGroups([stored], now)[0].label).toBe("Minggu ini");
  });
});
