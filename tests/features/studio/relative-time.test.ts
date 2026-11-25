import { describe, expect, it } from "vitest";
import { formatChanged } from "@/features/studio/relative-time";

const now = new Date(2026, 10, 14, 15, 0).getTime();
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m).getTime();

describe("formatChanged", () => {
  it("says 'baru saja' under a minute", () =>
    expect(formatChanged(now - 20_000, now)).toBe("baru saja"));
  it("uses minutes under an hour", () =>
    expect(formatChanged(at(14, 14, 20), now)).toBe("40 menit lalu"));
  it("uses hours within the same day", () =>
    expect(formatChanged(at(14, 13), now)).toBe("2 jam lalu"));
  it("uses the clock for earlier today", () =>
    expect(formatChanged(at(14, 8, 40), now)).toBe("hari ini 08.40"));
  it("uses the date for other days, with the year only when it differs", () => {
    expect(formatChanged(at(10, 9), now)).toBe("10 Nov");
    expect(formatChanged(new Date(2025, 11, 31, 9).getTime(), now)).toBe("31 Des 2025");
  });
});

describe("formatChanged with a fixed time zone", () => {
  // 2026-11-24 01:00 UTC is 08:00 in Jakarta and 17:00 on the 23rd in Los Angeles.
  const now = Date.UTC(2026, 10, 24, 1, 0);
  const yesterday = now - 24 * 60 * 60_000;

  it("names the calendar day in that zone, not the device's", () => {
    expect(formatChanged(yesterday, now, "id", "Asia/Jakarta")).toBe("23 Nov");
    expect(formatChanged(yesterday, now, "id", "America/Los_Angeles")).toBe("22 Nov");
  });

  it("reads the clock in that zone for earlier hours of the same day", () => {
    const earlier = Date.UTC(2026, 10, 23, 18, 5); // 7 hours before, 01:05 on the 24th in Jakarta
    expect(formatChanged(earlier, now, "id", "Asia/Jakarta")).toBe("hari ini 01.05");
  });
});
