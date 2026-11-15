import { describe, expect, it } from "vitest";
import { formatAgo, formatDay } from "@/features/community/format-time";

const NOW = new Date(2026, 10, 15, 12, 0).getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatAgo", () => {
  it.each([
    [10_000, "baru saja"],
    [40 * MIN, "40 menit"],
    [2 * HOUR, "2 jam"],
    [1 * DAY + HOUR, "kemarin"],
    [3 * DAY, "3 hari"],
  ])("renders %i ms ago as %s", (ago, label) => {
    expect(formatAgo(NOW - ago, NOW)).toBe(label);
  });

  it("falls back to a date after a week, with the year only when it differs", () => {
    expect(formatAgo(NOW - 10 * DAY, NOW)).toBe("5 Nov");
    expect(formatDay(new Date(2025, 11, 3).getTime(), NOW)).toBe("3 Des 2025");
  });

  it("never shows a negative time when the clock is behind", () => {
    expect(formatAgo(NOW + HOUR, NOW)).toBe("baru saja");
  });
});
