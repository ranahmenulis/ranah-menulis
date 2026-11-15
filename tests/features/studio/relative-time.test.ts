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
