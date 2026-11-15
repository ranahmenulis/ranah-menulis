import { describe, expect, it } from "vitest";
import {
  addDays,
  dayState,
  milestones,
  monthGrid,
  summarizeStreak,
  targetFor,
  weekStart,
  weekStats,
} from "./streak";

const t500 = [{ from: "2026-01-01", value: 500 }];
const words = (entries: Record<string, number>) => new Map(Object.entries(entries));

describe("targetFor", () => {
  it("is null before the first target and follows changes from their start day", () => {
    const changes = [
      { from: "2026-11-01", value: 500 },
      { from: "2026-11-15", value: 750 },
    ];
    expect(targetFor(changes, "2026-10-31")).toBeNull();
    expect(targetFor(changes, "2026-11-14")).toBe(500);
    expect(targetFor(changes, "2026-11-15")).toBe(750);
  });
});

describe("summarizeStreak", () => {
  it("counts consecutive met days and does not break on a running day", () => {
    const w = words({ "2026-11-11": 505, "2026-11-12": 812, "2026-11-13": 540, "2026-11-14": 120 });
    expect(summarizeStreak(w, t500, "2026-11-14").current).toBe(3);
  });

  it("adds today once the target is reached", () => {
    const w = words({ "2026-11-12": 600, "2026-11-13": 540, "2026-11-14": 512 });
    expect(summarizeStreak(w, t500, "2026-11-14").current).toBe(3);
  });

  it("is zero after a full day without reaching the target", () => {
    const w = words({ "2026-11-11": 600, "2026-11-12": 600, "2026-11-14": 10 });
    expect(summarizeStreak(w, t500, "2026-11-14").current).toBe(0);
  });

  it("reports the longest run with its dates", () => {
    const w = words({
      "2026-10-02": 500,
      "2026-10-03": 500,
      "2026-10-04": 500,
      "2026-10-10": 500,
      "2026-10-11": 500,
    });
    expect(summarizeStreak(w, t500, "2026-11-14").longest).toEqual({
      length: 3,
      start: "2026-10-02",
      end: "2026-10-04",
    });
  });

  it("counts nothing while no target has been set", () => {
    const w = words({ "2026-11-13": 900, "2026-11-14": 900 });
    expect(summarizeStreak(w, [], "2026-11-14")).toEqual({ current: 0, longest: null, last: null });
  });

  it("judges each day by the target in force that day", () => {
    const changes = [
      { from: "2026-11-01", value: 500 },
      { from: "2026-11-14", value: 1000 },
    ];
    const w = words({ "2026-11-13": 600, "2026-11-14": 600 });
    expect(summarizeStreak(w, changes, "2026-11-14").current).toBe(1);
  });
});

describe("calendar", () => {
  it("lays out November 2026 starting on a Sunday, with weeks beginning Monday", () => {
    const cells = monthGrid(2026, 10);
    expect(cells).toHaveLength(42);
    expect(cells.slice(0, 6).every((c) => !c.inMonth)).toBe(true);
    expect(cells[6]).toEqual({ day: "2026-11-01", inMonth: true });
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });

  it("classifies days as met, partial, empty or future", () => {
    const w = words({ "2026-11-12": 600, "2026-11-13": 40 });
    const state = (d: string) => dayState(d, "2026-11-14", w, t500);
    expect(state("2026-11-12")).toBe("met");
    expect(state("2026-11-13")).toBe("partial");
    expect(state("2026-11-11")).toBe("empty");
    expect(state("2026-11-15")).toBe("future");
  });
});

describe("weekStats", () => {
  it("sums Monday through today and averages over the days elapsed", () => {
    expect(weekStart("2026-11-14")).toBe("2026-11-09");
    const w = words({ "2026-11-08": 999, "2026-11-09": 300, "2026-11-12": 600, "2026-11-14": 120 });
    const stats = weekStats(w, "2026-11-14", "2026-11");
    expect(stats.total).toBe(1020);
    expect(stats.average).toBe(170);
    expect(stats.best).toEqual({ day: "2026-11-08", words: 999 });
  });

  it("has no best day for an empty month", () => {
    expect(weekStats(words({}), "2026-11-14", "2026-11").best).toBeNull();
  });
});

describe("milestones", () => {
  it("marks reached ones with the day they were reached and the rest with what remains", () => {
    const entries: Record<string, number> = {};
    for (let i = 0; i < 7; i++) entries[addDays("2026-11-01", i)] = 500;
    const list = milestones(words(entries), t500, "2026-11-07");

    const seven = list.find((m) => m.id === "streak-7")!;
    expect(seven.achievedOn).toBe("2026-11-07");
    const fourteen = list.find((m) => m.id === "streak-14")!;
    expect(fourteen.achievedOn).toBeNull();
    expect(fourteen.remaining).toBe("7 hari lagi");
    expect(list.find((m) => m.id === "words-10000")!.remaining).toBe("6.500 kata lagi");
  });
});
