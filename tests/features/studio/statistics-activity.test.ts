// @vitest-environment node
import { describe, expect, it } from "vitest";
import { writingMetrics } from "@/features/studio/statistics-activity";
import { writingTime } from "@/features/studio/writing-time";

describe("writingTime", () => {
  it("uses the account date and hour on both sides of midnight", () => {
    const instant = Date.parse("2026-11-19T17:30:00Z");
    expect(writingTime(instant, "Asia/Jakarta")).toEqual({ day: "2026-11-20", hour: 0 });
    expect(writingTime(instant, "America/Los_Angeles")).toEqual({ day: "2026-11-19", hour: 9 });
    expect(writingTime(instant, "Asia/Kuala_Lumpur")).toEqual({ day: "2026-11-20", hour: 1 });
  });
});

describe("writingMetrics", () => {
  it("uses the chart range and averages words across active days only", () => {
    const words = new Map([
      ["2026-11-01", 1000],
      ["2026-11-09", 20],
      ["2026-11-10", 0],
      ["2026-11-16", 39],
      ["2026-11-23", 1000],
    ]);
    expect(writingMetrics(words, [], "2026-11-08", "2026-11-22")).toEqual({
      pace: 30,
      favoriteDay: 0,
      favoriteHour: null,
      wordsReduced: null,
    });
  });

  it("uses recorded hours as written, ranks ties by earlier hour, and recognizes zero reduction", () => {
    const history = [
      { day: "2026-11-19", docs: {}, activity: { wordsReduced: 0, wordsAddedByHour: { 9: 7 } } },
      { day: "2026-11-20", docs: {}, activity: { wordsReduced: 0, wordsAddedByHour: { 0: 7 } } },
      { day: "2026-11-21", docs: {}, activity: { wordsReduced: 99, wordsAddedByHour: { 1: 200 } } },
    ];
    expect(writingMetrics(new Map(), history, "2026-11-19", "2026-11-20")).toEqual({
      pace: null,
      favoriteDay: null,
      favoriteHour: 0,
      wordsReduced: 0,
    });
    expect(writingMetrics(new Map(), history, "2026-11-21", "2026-11-21").wordsReduced).toBe(99);
  });
});
