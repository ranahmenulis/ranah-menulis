import { describe, expect, it } from "vitest";
import { formatAbsolute, formatAgo, formatDay } from "@/features/community/format-time";
import { formatChanged } from "@/features/studio/relative-time";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const NOW = new Date(2026, 10, 22, 12, 0).getTime();

describe("formatAgo", () => {
  it("keeps Indonesian by default", () => {
    expect(formatAgo(NOW - 40 * MIN, NOW)).toBe("40 menit");
    expect(formatAgo(NOW - DAY - HOUR, NOW)).toBe("kemarin");
  });

  it("writes English units", () => {
    expect(formatAgo(NOW - 10_000, NOW, "en")).toBe("just now");
    expect(formatAgo(NOW - 40 * MIN, NOW, "en")).toBe("40 min");
    expect(formatAgo(NOW - 2 * HOUR, NOW, "en")).toBe("2 hr");
    expect(formatAgo(NOW - DAY - HOUR, NOW, "en")).toBe("yesterday");
    expect(formatAgo(NOW - 3 * DAY, NOW, "en")).toBe("3 days");
  });
});

describe("formatDay and formatAbsolute", () => {
  it("orders day and month per language and adds the year only when it differs", () => {
    const earlier = new Date(2026, 10, 12, 3, 37).getTime();
    expect(formatDay(earlier, NOW)).toBe("12 Nov");
    expect(formatDay(earlier, NOW, "en")).toBe("Nov 12");
    const lastYear = new Date(2025, 4, 3).getTime();
    expect(formatDay(lastYear, NOW)).toBe("3 Mei 2025");
    expect(formatDay(lastYear, NOW, "en")).toBe("May 3, 2025");
    expect(formatAbsolute(earlier, NOW)).toBe("12 Nov pukul 03.37");
    expect(formatAbsolute(earlier, NOW, "en")).toBe("Nov 12 at 03:37");
  });
});

describe("formatChanged", () => {
  it("writes the edited-time phrases in both languages", () => {
    expect(formatChanged(NOW - 40 * MIN, NOW)).toBe("40 menit lalu");
    expect(formatChanged(NOW - 40 * MIN, NOW, "en")).toBe("40 min ago");
    expect(formatChanged(NOW - 2 * HOUR, NOW, "en")).toBe("2 hr ago");
    const earlierToday = new Date(2026, 10, 22, 0, 30).getTime();
    expect(formatChanged(earlierToday, NOW + 6 * HOUR, "en")).toMatch(/^today \d\d:\d\d$/);
    expect(formatChanged(new Date(2026, 10, 10).getTime(), NOW, "en")).toBe("Nov 10");
  });
});
