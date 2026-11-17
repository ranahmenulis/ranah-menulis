import { describe, expect, it } from "vitest";
import {
  formatRemaining,
  parseMinutes,
  remainingMs,
  resultText,
  spokenDuration,
  sprintWords,
} from "@/features/studio/sprint";

describe("parseMinutes", () => {
  it.each([
    ["25", 25],
    [" 10 ", 10],
    ["1", 1],
    ["180", 180],
  ])("accepts %j", (input, expected) => {
    expect(parseMinutes(input)).toBe(expected);
  });

  it.each(["", "0", "181", "-5", "2.5", "abc", "1e2"])("rejects %j", (input) => {
    expect(parseMinutes(input)).toBeNull();
  });
});

describe("time", () => {
  it("never goes below zero", () => {
    expect(remainingMs(1000, 1, 1000 + 61_000)).toBe(0);
    expect(remainingMs(1000, 1, 1000 + 30_000)).toBe(30_000);
  });

  it("formats minutes and, from one hour, hours; rounding up so 0:00 means over", () => {
    expect(formatRemaining(25 * 60_000)).toBe("25:00");
    expect(formatRemaining(24 * 60_000 + 30_500)).toBe("24:31");
    expect(formatRemaining(500)).toBe("0:01");
    expect(formatRemaining(0)).toBe("0:00");
    expect(formatRemaining(65 * 60_000)).toBe("1:05:00");
  });

  it("speaks whole and partial minutes", () => {
    expect(spokenDuration(25 * 60_000)).toBe("25 menit");
    expect(spokenDuration(90_000)).toBe("1 menit 30 detik");
    expect(spokenDuration(40_000)).toBe("40 detik");
  });
});

describe("sprint words", () => {
  it("counts what was added and never goes negative", () => {
    expect(sprintWords(100, 412)).toBe(312);
    expect(sprintWords(100, 60)).toBe(0);
  });

  it("describes the result", () => {
    expect(
      resultText({
        phase: "done",
        minutes: 25,
        elapsedMs: 25 * 60_000,
        words: 1312,
        stopped: false,
      }),
    ).toBe("1.312 kata dalam 25 menit");
  });
});
