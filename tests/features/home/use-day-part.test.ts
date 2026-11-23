import { describe, expect, it } from "vitest";
import { partOf } from "@/features/home/use-day-part";

const at = (iso: string) => Date.parse(iso);

describe("partOf", () => {
  it("is null until the clock has been read", () => {
    expect(partOf(0, "Asia/Jakarta")).toBeNull();
  });

  it("follows the hour in the account zone, not the device zone", () => {
    // 22:00 UTC is 05:00 in Jakarta (morning) and 22:00 in UTC (night).
    const now = at("2026-11-23T22:00:00Z");
    expect(partOf(now, "Asia/Jakarta")).toBe("pagi");
    expect(partOf(now, "UTC")).toBe("malam");
  });

  it("covers the four parts of the day", () => {
    expect(partOf(at("2026-11-23T03:00:00Z"), "UTC")).toBe("malam");
    expect(partOf(at("2026-11-23T08:00:00Z"), "UTC")).toBe("pagi");
    expect(partOf(at("2026-11-23T12:00:00Z"), "UTC")).toBe("siang");
    expect(partOf(at("2026-11-23T17:00:00Z"), "UTC")).toBe("senja");
  });
});
