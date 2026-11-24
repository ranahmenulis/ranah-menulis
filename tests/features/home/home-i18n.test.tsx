import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";
import { FollowRow } from "@/features/home/follow-row";
import { FirstSteps } from "@/features/home/steps";
import { greetingSentence, weekSentence } from "@/features/home/week-summary";
import { home as homeEn } from "@/features/home/copy/en";
import { home as homeId } from "@/features/home/copy/id";

vi.mock("@/features/home/first-steps-store", () => ({
  useFirstStepsDismissed: () => false,
  dismissFirstSteps: () => {},
}));

afterEach(cleanup);

const english = (node: React.ReactNode) =>
  render(
    <I18nProvider locale="en" dictionary={dictionaries.en}>
      {node}
    </I18nProvider>,
  );

describe("week sentence in two languages", () => {
  it("keeps the Indonesian sentences by default", () => {
    expect(weekSentence(1200, 0)).toBe("7 hari terakhir kamu menulis 1.200 kata. Awal yang baik.");
  });

  it("writes English with English numbers and singular words", () => {
    expect(weekSentence(1200, 0, homeEn.week, "en")).toBe(
      "In the last 7 days you wrote 1,200 words. A good start.",
    );
    expect(weekSentence(1, 0, homeEn.week, "en")).toBe(
      "In the last 7 days you wrote 1 word. A good start.",
    );
    expect(weekSentence(900, 500, homeEn.week, "en")).toContain("400 words more than");
    expect(weekSentence(0, 500, homeEn.week, "en")).toContain("after writing 500 words");
    expect(weekSentence(0, 0, homeEn.week, "en")).toBeNull();
  });

  it("is quiet while there is no data", () => {
    const loading = { status: "loading", today: "", words: new Map() } as never;
    expect(greetingSentence(loading, homeEn.week, "en")).toBeNull();
  });
});

describe("home copy", () => {
  it("has English text for every Indonesian key", () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        typeof v === "object" ? keys(v).map((x) => `${k}.${x}`) : [k],
      );
    expect(keys(homeEn)).toEqual(keys(homeId));
  });
});

describe("home components in English", () => {
  it("shows the first steps in English", () => {
    english(<FirstSteps hasTarget={false} hasDocument={false} />);
    expect(screen.getByRole("list", { name: "Three first steps" })).toBeTruthy();
    expect(screen.getByText("Set a daily word target")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close guide" })).toBeTruthy();
  });

  it("labels the follow row in English", () => {
    english(<FollowRow items={[{ name: "Hafiz Rahman", fresh: true, href: "/penulis/x" }]} />);
    expect(screen.getByRole("list", { name: "Writers and circles you follow" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "New work" })).toBeTruthy();
    expect(screen.getByText("Discover")).toBeTruthy();
  });
});
