import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { studioStreak as streakEn } from "@/features/studio/copy/streak-en";
import { studioStreak as streakId } from "@/features/studio/copy/streak-id";
import { MilestoneList } from "@/features/studio/components/streak/milestone-list";
import { StreakCalendar } from "@/features/studio/components/streak/streak-calendar";
import { StreakHero } from "@/features/studio/components/streak/streak-hero";
import { StreakHistory } from "@/features/studio/components/streak/streak-history";
import { StatsSection, TodaySection } from "@/features/studio/components/streak/streak-sections";
import { TargetDialog } from "@/features/studio/components/streak/target-dialog";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { capitalizeFirst, formatRun, streakLine, todayLine } from "@/features/studio/streak-copy";
import { milestones, summarizeStreak } from "@/features/studio/streak";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(cleanup);

const english = (node: React.ReactNode) =>
  render(
    <I18nProvider locale="en" dictionary={dictionaries.en}>
      {node}
    </I18nProvider>,
  );

const today = "2026-11-14";
const changes = [{ from: "2026-11-01", value: 500 }];
const words = new Map([
  ["2026-11-11", 600],
  ["2026-11-12", 520],
  ["2026-11-13", 40],
  ["2026-11-14", 250],
]);

function data(over: Partial<StreakData> = {}): StreakData {
  return {
    status: "ready",
    today,
    nowMs: 1,
    history: [],
    words,
    changes,
    target: 500,
    todayWords: 250,
    summary: summarizeStreak(words, changes, today),
    lastDocument: null,
    reload: () => {},
    setTarget: () => {},
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

describe("Streak dictionary", () => {
  it("has no empty text and matches the Indonesian keys and placeholders", () => {
    expect(emptyKeys(streakEn)).toEqual([]);
    expect(shape(streakEn)).toEqual(shape(streakId));
  });
});

describe("Streak sentences", () => {
  it("keeps Indonesian by default", () => {
    expect(todayLine({ target: 500, todayWords: 320, current: 6, broken: false })).toBe(
      "180 kata lagi sebelum hari berganti pukul 00.00.",
    );
    expect(formatRun({ length: 5, start: "2026-11-08", end: "2026-11-12" })).toBe("8–12 Nov");
  });

  it("writes English sentences and dates", () => {
    expect(todayLine({ target: 2000, todayWords: 320, current: 6, broken: false }, "en")).toBe(
      "1,680 more words before the day changes at 00:00.",
    );
    expect(todayLine({ target: 500, todayWords: 512, current: 7, broken: false }, "en")).toBe(
      "Today's target is reached. Your streak is now 7 days.",
    );
    expect(todayLine({ target: 500, todayWords: 120, current: 0, broken: true }, "en")).toBe(
      "380 more words to start a new streak today.",
    );
    expect(formatRun({ length: 5, start: "2026-11-08", end: "2026-11-12" }, "en")).toBe("Nov 8–12");
    expect(formatRun({ length: 6, start: "2026-10-28", end: "2026-11-02" }, "en")).toBe(
      "Oct 28–Nov 2",
    );
    expect(streakLine({ reachedToday: true, current: 7, last: null }, "en")).toBe(
      "Today is counted.",
    );
    expect(capitalizeFirst("tuesday", "en")).toBe("Tuesday");
  });

  it("writes English milestones", () => {
    const items = milestones(words, changes, today, "en");
    expect(items[0].title).toBe("7 days in a row");
    expect(items[0].remaining).toBe("7 days to go");
    const tenK = items.find((item) => item.id === "words-10000");
    expect(tenK?.title).toBe("10,000 words");
    expect(tenK?.remaining).toBe("8,590 words to go");
  });
});

describe("Streak screens in English", () => {
  it("renders the hero with English labels", () => {
    english(<StreakHero data={data()} reachedToday={false} />);
    expect(screen.getByText("Current streak")).toBeTruthy();
    expect(screen.getByText("days in a row")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Today's progress" })).toBeTruthy();
    expect(screen.getByText("/ 500 words")).toBeTruthy();
    expect(screen.getByRole("list", { name: "Last seven days" })).toBeTruthy();
  });

  it("renders today's section and the target invitation", () => {
    english(
      <TodaySection
        data={data()}
        startHref="/studio/baru"
        reachedToday={false}
        onSetTarget={() => {}}
      />,
    );
    expect(screen.getByText("250 more words to start a new streak today.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start writing" })).toBeTruthy();
    cleanup();
    english(
      <TodaySection
        data={data({ target: null })}
        startHref="/studio/baru"
        reachedToday={false}
        onSetTarget={() => {}}
      />,
    );
    expect(screen.getByText("No daily target yet.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Set target" })).toBeTruthy();
  });

  it("renders the quick statistics", () => {
    english(<StatsSection words={words} today={today} hasWriting />);
    expect(screen.getByText("words this week")).toBeTruthy();
    expect(screen.getByRole("link", { name: "See all statistics" })).toBeTruthy();
    cleanup();
    english(<StatsSection words={new Map()} today={today} hasWriting={false} />);
    expect(screen.getByText(/Not enough data for statistics yet/)).toBeTruthy();
  });

  it("renders the calendar with English month, weekdays and labels", () => {
    english(
      <StreakCalendar
        today={today}
        words={words}
        history={[]}
        changes={changes}
        celebrate={false}
      />,
    );
    expect(screen.getByRole("heading", { name: "November 2026" })).toBeTruthy();
    expect(
      screen.getByRole("grid", { name: /Calendar November 2026, weeks start on Monday/ }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nov 12, 520 words, target reached" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nov 14, today, 250 words" })).toBeTruthy();
    expect(screen.getByText("Target reached")).toBeTruthy();
  });

  it("renders the milestone list and the streak history", () => {
    english(<MilestoneList items={milestones(words, changes, today, "en")} today={today} />);
    expect(screen.getByRole("heading", { name: "Milestones" })).toBeTruthy();
    cleanup();
    english(<StreakHistory items={[]} />);
    expect(screen.getByText(/No streak has ended yet/)).toBeTruthy();
    cleanup();
    english(
      <StreakHistory
        items={[
          {
            length: 3,
            start: "2026-01-05",
            end: "2026-01-07",
            brokeOn: "2026-01-09",
            longest: true,
          },
        ]}
      />,
    );
    expect(screen.getByText("3 days")).toBeTruthy();
    expect(screen.getByText("Longest")).toBeTruthy();
    expect(screen.getByText("Jan 5–7 · broke on Jan 9")).toBeTruthy();
  });

  it("renders the target dialog in English", () => {
    english(<TargetDialog open current={500} onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByText("Adjust your daily target")).toBeTruthy();
    expect(screen.getByLabelText("Words per day")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Quick picks" })).toBeTruthy();
  });
});
