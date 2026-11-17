import { describe, expect, it } from "vitest";
import { weekComparison, wordTotals } from "@/features/studio/word-totals";

describe("wordTotals", () => {
  // 2026-11-18 is a Wednesday, so the week starts Monday 2026-11-16.
  const words = new Map([
    ["2025-12-31", 900],
    ["2026-01-01", 100],
    ["2026-10-31", 200],
    ["2026-11-01", 300],
    ["2026-11-15", 400], // Sunday, last week
    ["2026-11-16", 50],
    ["2026-11-18", 70],
  ]);

  it("sums this week from Monday, this month and this year", () => {
    expect(wordTotals(words, "2026-11-18")).toEqual({
      week: 120,
      month: 820,
      year: 1120,
    });
  });

  it("counts a week that crosses into the previous month for the week only", () => {
    // 2026-12-02 is a Wednesday; its week started 2026-11-30.
    const crossing = new Map([
      ["2026-11-30", 10],
      ["2026-12-01", 20],
      ["2026-12-02", 30],
    ]);
    expect(wordTotals(crossing, "2026-12-02")).toEqual({ week: 60, month: 50, year: 60 });
  });

  it("ignores days after today and returns zeros for no data", () => {
    expect(wordTotals(new Map([["2026-11-19", 500]]), "2026-11-18")).toEqual({
      week: 0,
      month: 0,
      year: 0,
    });
  });

  it("handles a leap day inside the year", () => {
    const leap = new Map([["2028-02-29", 40]]);
    expect(wordTotals(leap, "2028-03-01").year).toBe(40);
  });
});

describe("weekComparison", () => {
  it("compares the 7 days ending today with the 7 days before", () => {
    const words = new Map([
      ["2026-11-18", 100], // recent (today)
      ["2026-11-12", 50], // recent (6 days ago)
      ["2026-11-11", 30], // before (7 days ago)
      ["2026-11-05", 20], // before (13 days ago)
      ["2026-11-04", 999], // outside both
    ]);
    expect(weekComparison(words, "2026-11-18")).toEqual({ recent: 150, before: 50 });
  });

  it("is zero on both sides when there is no data", () => {
    expect(weekComparison(new Map(), "2026-11-18")).toEqual({ recent: 0, before: 0 });
  });
});
