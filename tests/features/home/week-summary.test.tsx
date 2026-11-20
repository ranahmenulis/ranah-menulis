import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WordTotals, greetingSentence, weekSentence } from "@/features/home/week-summary";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";

afterEach(cleanup);

function data(overrides: Partial<StreakData>): StreakData {
  return {
    status: "ready",
    today: "2026-11-18",
    nowMs: 0,
    history: [],
    words: new Map(),
    changes: [],
    target: null,
    todayWords: 0,
    summary: { current: 0, longest: null, last: null },
    lastDocument: null,
    reload: () => {},
    setTarget: () => {},
    ...overrides,
  };
}

describe("weekSentence", () => {
  it("says nothing without any writing", () => {
    expect(weekSentence(0, 0)).toBeNull();
  });

  it("compares in words, never in percentages", () => {
    expect(weekSentence(3200, 2400)).toBe(
      "7 hari terakhir kamu menulis 3.200 kata, 800 kata lebih banyak dari 7 hari sebelumnya.",
    );
    const down = weekSentence(1000, 1600);
    expect(down).toContain("600 kata lebih sedikit");
    expect(down).toContain("Mulai lagi hari ini saja.");
    expect(down).not.toContain("%");
  });

  it("handles a first week, an equal week and a silent week", () => {
    expect(weekSentence(500, 0)).toContain("Awal yang baik.");
    expect(weekSentence(500, 500)).toContain("sama dengan 7 hari sebelumnya");
    expect(weekSentence(0, 900)).toContain("belum ada tulisan");
  });
});

describe("greetingSentence", () => {
  it("compares the last 7 days with the 7 before", () => {
    const words = new Map([
      ["2026-11-18", 70],
      ["2026-11-08", 30],
    ]);
    expect(greetingSentence(data({ words }))).toBe(
      "7 hari terakhir kamu menulis 70 kata, 40 kata lebih banyak dari 7 hari sebelumnya.",
    );
  });

  it("says nothing while loading, on error or with no writing", () => {
    expect(greetingSentence(data({ status: "loading", today: "" }))).toBeNull();
    expect(greetingSentence(data({ status: "error" }))).toBeNull();
    expect(greetingSentence(data({}))).toBeNull();
  });
});

describe("WordTotals", () => {
  it("shows the three calendar totals", () => {
    const words = new Map([
      ["2026-11-18", 70],
      ["2026-11-16", 50],
      ["2026-11-01", 300],
      ["2026-01-05", 100],
    ]);
    render(<WordTotals data={data({ words })} />);

    expect(screen.getByText("Minggu ini").nextElementSibling?.textContent).toContain("120");
    expect(screen.getByText("Bulan ini").nextElementSibling?.textContent).toContain("420");
    expect(screen.getByText("Tahun ini").nextElementSibling?.textContent).toContain("520");
  });

  it("is not drawn while loading, on error or with no writing", () => {
    const loading = render(<WordTotals data={data({ status: "loading", today: "" })} />);
    expect(loading.container.firstChild).toBeNull();
    const failed = render(<WordTotals data={data({ status: "error" })} />);
    expect(failed.container.firstChild).toBeNull();
    const empty = render(<WordTotals data={data({})} />);
    expect(empty.container.firstChild).toBeNull();
  });
});
