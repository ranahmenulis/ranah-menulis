import { describe, expect, it } from "vitest";
import { capitalizeFirst, formatRun, streakLine, todayLine } from "@/features/studio/streak-copy";

describe("todayLine", () => {
  it("says how many words remain before the day turns", () => {
    expect(todayLine({ target: 500, todayWords: 320, current: 6, broken: false })).toBe(
      "180 kata lagi sebelum hari berganti pukul 00.00.",
    );
  });

  it("announces the target and the new streak length once reached", () => {
    expect(todayLine({ target: 500, todayWords: 512, current: 7, broken: false })).toBe(
      "Target hari ini tercapai. Streakmu naik menjadi 7 hari.",
    );
  });

  it("frames a broken streak as starting a new one, without blame", () => {
    expect(todayLine({ target: 500, todayWords: 120, current: 0, broken: true })).toBe(
      "380 kata lagi untuk memulai streak baru hari ini.",
    );
  });
});

describe("streakLine", () => {
  it("says whether today is counted", () => {
    expect(streakLine({ reachedToday: true, current: 7, last: null })).toBe(
      "Hari ini sudah dihitung.",
    );
    expect(streakLine({ reachedToday: false, current: 6, last: null })).toBe(
      "Hari ini belum dihitung sampai target tercapai.",
    );
  });

  it("remembers the broken streak and reassures that the calendar keeps everything", () => {
    const text = streakLine({
      reachedToday: false,
      current: 0,
      last: { length: 5, start: "2026-11-08", end: "2026-11-12" },
    });
    expect(text).toContain("Streak sebelumnya 5 hari, 8–12 Nov.");
    expect(text).toContain("Kalender tetap menyimpan");
  });
});

describe("formatRun", () => {
  it("writes a range inside one month once, and across months in full", () => {
    expect(formatRun({ length: 5, start: "2026-11-08", end: "2026-11-12" })).toBe("8–12 Nov");
    expect(formatRun({ length: 6, start: "2026-10-28", end: "2026-11-02" })).toBe("28 Okt–2 Nov");
  });

  it("shows a single day without a range", () => {
    expect(formatRun({ length: 1, start: "2026-11-08", end: "2026-11-08" })).toBe("8 Nov");
  });
});

describe("capitalizeFirst", () => {
  it("raises only the first letter", () =>
    expect(capitalizeFirst("minggu, 15 Nov")).toBe("Minggu, 15 Nov"));
});
