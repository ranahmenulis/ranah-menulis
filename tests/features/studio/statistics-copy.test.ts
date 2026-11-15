import { describe, expect, it } from "vitest";
import type { Bucket } from "@/features/studio/statistics";
import {
  axisLabel,
  bucketTitle,
  formatRange,
  rangeName,
  readout,
  targetNote,
  tickLabel,
} from "@/features/studio/statistics-copy";

const day = (over: Partial<Bucket> = {}): Bucket => ({
  start: "2026-11-03",
  end: "2026-11-03",
  words: 320,
  target: 500,
  targetDays: 1,
  metDays: 0,
  ...over,
});
const week: Bucket = {
  start: "2026-11-09",
  end: "2026-11-15",
  words: 1400,
  target: null,
  targetDays: 6,
  metDays: 2,
};

describe("statistics copy", () => {
  it("names the range", () => {
    expect(rangeName("day")).toBe("30 hari terakhir");
    expect(rangeName("week")).toBe("12 minggu terakhir");
    expect(rangeName("month")).toBe("12 bulan terakhir");
  });

  it("writes full numbers under 10.000 and compact ones above", () => {
    expect(tickLabel(2500, 5000)).toBe("2.500");
    expect(tickLabel(20_000, 40_000)).toMatch(/^20\s?rb$/);
  });

  it("formats ranges inside and across months", () => {
    expect(formatRange("2026-11-09", "2026-11-15")).toBe("9–15 Nov");
    expect(formatRange("2026-10-27", "2026-11-02")).toBe("27 Okt – 2 Nov");
    expect(formatRange("2026-11-03", "2026-11-03")).toBe("3 Nov");
  });

  it("labels the axis by the bucket start", () => {
    expect(axisLabel(day(), "day")).toBe("3 Nov");
    expect(axisLabel(week, "week")).toBe("9 Nov");
    expect(axisLabel(day({ start: "2026-11-01" }), "month")).toBe("Nov");
  });

  it("titles each period", () => {
    expect(bucketTitle(day(), "day")).toBe("Selasa, 3 November");
    expect(bucketTitle(week, "week")).toBe("Minggu 9–15 Nov");
    expect(bucketTitle(day({ start: "2026-11-01" }), "month")).toBe("November 2026");
  });

  it("says how a day stands against its target, or nothing without one", () => {
    expect(targetNote(day(), "day")).toBe("target 500");
    expect(targetNote(day({ words: 520 }), "day")).toBe("memenuhi target 500");
    expect(targetNote(day({ target: null }), "day")).toBeNull();
    expect(targetNote(week, "week")).toBe("2 dari 6 hari memenuhi target");
    expect(targetNote({ ...week, targetDays: 0 }, "week")).toBeNull();
  });

  it("puts the readout on one line", () => {
    expect(readout(day(), "day")).toBe("Selasa, 3 November · 320 kata · target 500");
    expect(readout(day({ target: null, words: 1234 }), "day")).toBe(
      "Selasa, 3 November · 1.234 kata",
    );
  });
});
