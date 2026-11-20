import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StreakHistory } from "@/features/studio/components/streak/streak-history";
import type { PastStreak } from "@/features/studio/streak";

afterEach(cleanup);

function run(i: number, longest = false): PastStreak {
  const day = String(i).padStart(2, "0");
  return {
    length: 3,
    start: `2026-01-${day}`,
    end: `2026-01-${day}`,
    brokeOn: `2026-02-${day}`,
    longest,
  };
}

describe("StreakHistory", () => {
  it("explains the empty state", () => {
    render(<StreakHistory items={[]} />);
    expect(screen.getByText(/Belum ada streak yang berakhir/)).toBeTruthy();
  });

  it("marks the longest run and shows when it broke", () => {
    render(<StreakHistory items={[run(1, true), run(2)]} />);
    expect(screen.getAllByText("Terpanjang")).toHaveLength(1);
    expect(screen.getAllByText(/putus pada/)).toHaveLength(2);
  });

  it("starts with 10 rows and expands on request", () => {
    render(<StreakHistory items={Array.from({ length: 12 }, (_, i) => run(i + 1))} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    fireEvent.click(screen.getByRole("button", { name: /Tampilkan semua \(12\)/ }));
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
  });
});
