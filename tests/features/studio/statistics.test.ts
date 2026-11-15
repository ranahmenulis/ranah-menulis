import { describe, expect, it } from "vitest";
import { axisTicks, eachDay, statistics } from "@/features/studio/statistics";

const words = (entries: Record<string, number>) => new Map(Object.entries(entries));
const t500 = [{ from: "2026-01-01", value: 500 }];
// 2026-11-15 is a Sunday.
const TODAY = "2026-11-15";

describe("statistics buckets", () => {
  it("makes 30 day buckets ending today, each with its words and its target that day", () => {
    const changes = [
      { from: "2026-01-01", value: 500 },
      { from: "2026-11-14", value: 750 },
    ];
    const { buckets } = statistics(
      words({ "2026-11-13": 320, "2026-11-15": 90 }),
      changes,
      TODAY,
      "day",
    );
    expect(buckets).toHaveLength(30);
    expect(buckets[0].start).toBe("2026-10-17");
    expect(buckets[29]).toMatchObject({ start: TODAY, end: TODAY, words: 90, target: 750 });
    expect(buckets[27]).toMatchObject({ start: "2026-11-13", words: 320, target: 500 });
  });

  it("makes 12 Monday-first week buckets and clips the running week to today", () => {
    const { buckets } = statistics(
      words({ "2026-11-09": 100, "2026-11-15": 50 }),
      [],
      TODAY,
      "week",
    );
    expect(buckets).toHaveLength(12);
    expect(buckets[11]).toMatchObject({ start: "2026-11-09", end: TODAY, words: 150 });
    expect(buckets[10]).toMatchObject({ start: "2026-11-02", end: "2026-11-08", words: 0 });
    expect(buckets.every((b) => b.target === null)).toBe(true);
  });

  it("makes 12 month buckets, the last one clipped to today", () => {
    const { buckets } = statistics(
      words({ "2026-10-31": 10, "2026-11-01": 20 }),
      [],
      TODAY,
      "month",
    );
    expect(buckets).toHaveLength(12);
    expect(buckets[0]).toMatchObject({ start: "2025-12-01", end: "2025-12-31" });
    expect(buckets[10]).toMatchObject({ start: "2026-10-01", end: "2026-10-31", words: 10 });
    expect(buckets[11]).toMatchObject({ start: "2026-11-01", end: TODAY, words: 20 });
  });

  it("starts the months across a year boundary", () => {
    const { buckets } = statistics(words({}), [], "2026-01-05", "month");
    expect(buckets[0].start).toBe("2025-02-01");
    expect(buckets[11]).toMatchObject({ start: "2026-01-01", end: "2026-01-05" });
  });
});

describe("statistics summary", () => {
  it("totals the range and finds the best day, the earliest on a tie", () => {
    const w = words({ "2026-11-10": 600, "2026-11-12": 812, "2026-11-13": 812, "2026-09-01": 5 });
    const { summary } = statistics(w, [], TODAY, "day");
    expect(summary.total).toBe(600 + 812 + 812); // 2026-09-01 is outside the 30 days
    expect(summary.best).toEqual({ day: "2026-11-12", words: 812 });
  });

  it("averages per day from the first writing day, empty days counted", () => {
    const { summary } = statistics(
      words({ "2026-11-10": 600, "2026-11-14": 300 }),
      [],
      TODAY,
      "day",
    );
    // 10..14 Nov = 5 days; today has no words yet, so it is not counted: 900 / 5.
    expect(summary.average).toBe(180);
  });

  it("counts today once it has words", () => {
    const { summary } = statistics(
      words({ "2026-11-14": 300, "2026-11-15": 300 }),
      [],
      TODAY,
      "day",
    );
    expect(summary.average).toBe(300);
  });

  it("does not dilute the average with weeks before the first writing day", () => {
    const { summary } = statistics(
      words({ "2026-11-14": 300, "2026-11-15": 100 }),
      [],
      TODAY,
      "month",
    );
    expect(summary.average).toBe(200);
  });

  it("uses the whole range when the writer started before it", () => {
    const w = words({ "2026-01-01": 100, "2026-11-15": 3000 });
    const { summary } = statistics(w, [], TODAY, "day");
    expect(summary.total).toBe(3000);
    expect(summary.average).toBe(100); // 30 days, today counted
  });

  it("is all zero without writing", () => {
    const { summary } = statistics(words({}), t500, TODAY, "day");
    expect(summary).toEqual({ total: 0, average: 0, best: null, targetDays: 0, metDays: 0 });
  });

  it("ignores a day in the future", () => {
    const { summary } = statistics(words({ "2026-12-01": 999 }), [], TODAY, "day");
    expect(summary.total).toBe(0);
    expect(summary.average).toBe(0);
  });
});

describe("statistics target comparison", () => {
  it("counts met and unmet days from the first writing day and leaves the running day out", () => {
    const w = words({ "2026-11-12": 600, "2026-11-13": 100, "2026-11-15": 200 });
    const { summary, buckets } = statistics(w, t500, TODAY, "day");
    // 12 met, 13 and 14 not met; today (200 < 500) is still running, so it is not counted.
    expect(summary).toMatchObject({ targetDays: 3, metDays: 1 });
    expect(buckets[29]).toMatchObject({ targetDays: 0, metDays: 0 });
  });

  it("counts today once it reached the target", () => {
    const { summary } = statistics(words({ "2026-11-15": 500 }), t500, TODAY, "day");
    expect(summary).toMatchObject({ targetDays: 1, metDays: 1 });
  });

  it("does not count days without a target in force", () => {
    const changes = [{ from: "2026-11-14", value: 500 }];
    const w = words({ "2026-11-12": 900, "2026-11-14": 600 });
    const { summary } = statistics(w, changes, TODAY, "day");
    expect(summary).toMatchObject({ targetDays: 1, metDays: 1 });
  });

  it("rolls the comparison up into week and month buckets", () => {
    const w = words({ "2026-11-09": 600, "2026-11-10": 100, "2026-11-11": 700 });
    const { buckets } = statistics(w, t500, TODAY, "week");
    expect(buckets[11]).toMatchObject({ targetDays: 6, metDays: 2 });
    const months = statistics(w, t500, TODAY, "month").buckets;
    expect(months[11]).toMatchObject({ targetDays: 6, metDays: 2 });
  });

  it("has no comparison without a target", () => {
    const { summary } = statistics(words({ "2026-11-14": 900 }), [], TODAY, "day");
    expect(summary).toMatchObject({ targetDays: 0, metDays: 0 });
  });
});

describe("axisTicks", () => {
  it("offers a short axis when there is nothing yet", () => {
    expect(axisTicks(0)).toEqual([0, 100]);
  });

  it("rounds the top up to a round step with at most four intervals", () => {
    expect(axisTicks(320)).toEqual([0, 100, 200, 300, 400]);
    expect(axisTicks(812)).toEqual([0, 500, 1000]);
    expect(axisTicks(1)).toEqual([0, 1]);
    expect(axisTicks(3)).toEqual([0, 1, 2, 3]);
  });

  it("stays whole and covers huge values", () => {
    const ticks = axisTicks(1_234_567);
    expect(ticks.length).toBeLessThanOrEqual(5);
    expect(ticks.at(-1)).toBeGreaterThanOrEqual(1_234_567);
    expect(ticks.every(Number.isInteger)).toBe(true);
  });
});

describe("eachDay", () => {
  it("is inclusive and empty when the end is before the start", () => {
    expect(eachDay("2026-02-27", "2026-03-02")).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
    ]);
    expect(eachDay("2026-03-02", "2026-03-01")).toEqual([]);
  });
});
