import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeRail } from "@/features/home/home-rail";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";

afterEach(cleanup);

function data(over: Partial<StreakData> = {}): StreakData {
  return {
    status: "ready",
    today: "2026-11-14",
    nowMs: 0,
    history: [],
    words: new Map(),
    changes: [],
    target: 500,
    todayWords: 120,
    summary: { current: 2, longest: null, last: null },
    lastDocument: null,
    reload: vi.fn(),
    setTarget: vi.fn(),
    ...over,
  };
}

describe("HomeRail", () => {
  it("draws progress first, then the links to the community", () => {
    render(<HomeRail data={data()} showProgress showProjects={false} />);
    const titles = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual(["Progres hari ini", "Bersama penulis lain"]);
    // Event and Grup Penulis moved to Community (client, 22 November 2026).
    expect(screen.queryByRole("link", { name: "Event" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Grup Penulis" })).toBeNull();
    expect(screen.getByRole("link", { name: "Tulis postingan" })).toBeTruthy();
  });

  it("leaves progress out while the first steps ask for a target", () => {
    render(<HomeRail data={data({ target: null })} showProgress={false} showProjects={false} />);
    expect(screen.queryByText("Progres hari ini")).toBeNull();
    expect(screen.queryByRole("link", { name: "Tetapkan target" })).toBeNull();
  });

  it("draws no project sections when nothing was joined", () => {
    render(
      <HomeRail
        data={data()}
        showProgress
        showProjects
        submissions={createMemorySubmissionStore()}
      />,
    );
    expect(screen.queryByText("Proyek saya")).toBeNull();
    expect(screen.queryByText("Perlu perhatian")).toBeNull();
  });
});
