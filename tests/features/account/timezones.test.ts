import { describe, expect, it } from "vitest";
import {
  countryForZone,
  DEFAULT_TIME_ZONE,
  deviceTimeZone,
  isTimeZone,
  zoneOptions,
} from "@/features/account/timezones";

describe("time zones", () => {
  it("knows real zone names and rejects the rest", () => {
    expect(isTimeZone("Asia/Jakarta")).toBe(true);
    expect(isTimeZone("Asia/Kuala_Lumpur")).toBe(true);
    expect(isTimeZone("Mars/Olympus")).toBe(false);
    expect(isTimeZone("")).toBe(false);
    expect(isTimeZone(7)).toBe(false);
  });

  it("reads a valid zone from the device", () => {
    expect(isTimeZone(deviceTimeZone())).toBe(true);
    expect(isTimeZone(DEFAULT_TIME_ZONE)).toBe(true);
  });

  it("offers the four launch zones, plus the current and device zones when they differ", () => {
    expect(zoneOptions("Asia/Jakarta", "Asia/Jakarta")).toHaveLength(4);
    expect(zoneOptions("Asia/Jakarta", "Europe/London")).toContain("Europe/London");
    expect(zoneOptions("Asia/Tokyo", "Asia/Tokyo").filter((z) => z === "Asia/Tokyo")).toHaveLength(
      1,
    );
  });

  it("guesses Malaysia only for a Malaysian zone", () => {
    expect(countryForZone("Asia/Kuala_Lumpur")).toBe("MY");
    expect(countryForZone("Asia/Jakarta")).toBe("ID");
    expect(countryForZone("Europe/London")).toBe("ID");
  });
});
