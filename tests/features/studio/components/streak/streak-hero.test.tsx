import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StreakHero } from "@/features/studio/components/streak/streak-hero";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { summarizeStreak } from "@/features/studio/streak";

afterEach(cleanup);

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

describe("StreakHero", () => {
  it("shows today's words as a progress bar toward the target", () => {
    render(<StreakHero data={data()} reachedToday={false} />);
    const ring = screen.getByRole("progressbar", { name: "Progres hari ini" });
    expect(ring.getAttribute("aria-valuenow")).toBe("250");
    expect(ring.getAttribute("aria-valuemax")).toBe("500");
    expect(within(ring).getByText("250")).toBeTruthy();
    expect(within(ring).getByText("/ 500 kata")).toBeTruthy();
  });

  it("states the current streak in full text", () => {
    render(
      <StreakHero
        data={data({ summary: { current: 3, longest: null, last: null } })}
        reachedToday
      />,
    );
    expect(screen.getByText("Streak saat ini")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("hari berturut-turut")).toBeTruthy();
  });

  it("lists the last seven days, today last, with what each day holds", () => {
    render(<StreakHero data={data()} reachedToday={false} />);
    const days = within(screen.getByRole("list", { name: "Tujuh hari terakhir" })).getAllByRole(
      "listitem",
    );
    expect(days).toHaveLength(7);
    expect(days[3].textContent).toContain("11 Nov: target tercapai");
    expect(days[5].textContent).toContain("13 Nov: ada tulisan");
    expect(days[0].textContent).toContain("8 Nov: kosong");
    expect(days[6].textContent).toContain("14 Nov: ada tulisan");
  });

  it("leaves the ring out when there is no target", () => {
    render(<StreakHero data={data({ target: null })} reachedToday={false} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
