import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { studioStats as statsEn } from "@/features/studio/copy/stats-en";
import { studioStats as statsId } from "@/features/studio/copy/stats-id";
import { StatisticsView } from "@/features/studio/components/statistics/statistics-view";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import type { Bucket } from "@/features/studio/statistics";
import {
  axisLabel,
  bucketTitle,
  formatRange,
  periodLabel,
  rangeName,
  readout,
  tickLabel,
  unitName,
} from "@/features/studio/statistics-copy";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";

let data: StreakData;

vi.mock("@/features/studio/hooks/use-streak-data", () => ({ useStreakData: () => data }));
vi.mock("next/navigation", () => ({ usePathname: () => "/studio/statistik" }));

afterEach(cleanup);

const english = (node: React.ReactNode) =>
  render(
    <I18nProvider locale="en" dictionary={dictionaries.en}>
      {node}
    </I18nProvider>,
  );

function make(over: Partial<StreakData> = {}): StreakData {
  return {
    status: "ready",
    today: "2026-11-15",
    nowMs: 0,
    history: [],
    words: new Map([
      ["2026-11-12", 600],
      ["2026-11-13", 100],
      ["2026-11-14", 812],
    ]),
    changes: [{ from: "2026-01-01", value: 500 }],
    target: 500,
    todayWords: 0,
    summary: { current: 1, longest: null, last: null },
    lastDocument: null,
    reload: vi.fn(),
    setTarget: vi.fn(),
    ...over,
  };
}

const emptyKeys = (value: unknown): string[] => {
  if (typeof value === "string") return value === "" ? ["(empty)"] : [];
  if (Array.isArray(value)) return value.flatMap(emptyKeys);
  return Object.entries(value as object).flatMap(([key, child]) =>
    emptyKeys(child).map((path) => `${key}.${path}`),
  );
};

const shape = (value: unknown): unknown =>
  typeof value === "string"
    ? (value.match(/\{\w+\}/g) ?? []).sort()
    : Array.isArray(value)
      ? value.length
      : Object.fromEntries(Object.entries(value as object).map(([k, v]) => [k, shape(v)]));

const day: Bucket = {
  start: "2026-11-03",
  end: "2026-11-03",
  words: 320,
  target: 500,
  targetDays: 1,
  metDays: 0,
};
const week: Bucket = { ...day, end: "2026-11-09", target: null, targetDays: 7, metDays: 3 };
const month: Bucket = { ...day, end: "2026-11-30", target: null };

describe("Statistics dictionary", () => {
  it("has no empty text and matches the Indonesian keys and placeholders", () => {
    expect(emptyKeys(statsEn)).toEqual([]);
    expect(shape(statsEn)).toEqual(shape(statsId));
  });
});

describe("Statistics copy functions", () => {
  it("keeps Indonesian by default", () => {
    expect(rangeName("week")).toBe("12 minggu terakhir");
    expect(periodLabel("month")).toBe("Bulanan");
    expect(readout(day, "day")).toBe("Selasa, 3 November · 320 kata · target 500");
    expect(formatRange("2026-11-03", "2026-11-09")).toBe("3–9 Nov");
  });

  it("writes English labels, dates and numbers", () => {
    expect(rangeName("day", "en")).toBe("last 30 days");
    expect(unitName("week", "en")).toBe("week");
    expect(periodLabel("week", "en")).toBe("Weekly");
    expect(readout(day, "day", "en")).toBe("Tuesday, November 3 · 320 words · target 500");
    expect(bucketTitle(week, "week", "en")).toBe("Week Nov 3–9");
    expect(bucketTitle(month, "month", "en")).toBe("November 2026");
    expect(readout(week, "week", "en")).toBe(
      "Week Nov 3–9 · 320 words · 3 of 7 days met the target",
    );
    expect(formatRange("2026-10-30", "2026-11-05", "en")).toBe("Oct 30 – Nov 5");
    expect(axisLabel(day, "day", "en")).toBe("Nov 3");
    expect(axisLabel(month, "month", "en")).toBe("Nov");
    expect(tickLabel(1500, 3000, "en")).toBe("1,500");
  });
});

describe("StatisticsView in English", () => {
  it("shows the total, statistics and chart with English text", () => {
    data = make();
    english(<StatisticsView />);

    expect(screen.getByText("1,512")).toBeTruthy();
    expect(screen.getByText("words in the last 30 days")).toBeTruthy();
    expect(screen.getByText("words, best day (Nov 14)")).toBeTruthy();
    expect(screen.getByText("of 3 days met the target")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Words per day, last 30 days" })).toBeTruthy();
    const units = screen.getByRole("group", { name: "Time unit" });
    expect(within(units).getByRole("button", { name: "Daily" })).toBeTruthy();
    expect(screen.getByText("View as table")).toBeTruthy();
    expect(screen.getByText("Writing metrics")).toBeTruthy();
    expect(screen.getByText("Pace")).toBeTruthy();
    expect(screen.getByText("Favorite day")).toBeTruthy();
    expect(screen.getByText("Thursday")).toBeTruthy();
  });

  it("shows the empty and error states in English", () => {
    data = make({ words: new Map() });
    english(<StatisticsView />);
    expect(screen.getByText(/Not enough data for statistics yet/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start writing" })).toBeTruthy();
    cleanup();

    data = make({ status: "error" });
    english(<StatisticsView />);
    expect(screen.getByText(/Statistics could not be loaded/)).toBeTruthy();
  });
});
