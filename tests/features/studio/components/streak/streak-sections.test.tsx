import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatsSection } from "@/features/studio/components/streak/streak-sections";

afterEach(cleanup);

describe("StatsSection", () => {
  it("links the three numbers to the full Statistik page", () => {
    render(<StatsSection words={new Map([["2026-11-14", 300]])} today="2026-11-14" hasWriting />);
    expect(screen.getByRole("link", { name: "Lihat semua statistik" }).getAttribute("href")).toBe(
      "/studio/statistik",
    );
  });

  it("shows the empty sentence, without the link, until there is writing", () => {
    render(<StatsSection words={new Map()} today="2026-11-14" hasWriting={false} />);
    expect(screen.getByText(/Belum cukup data untuk statistik/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Lihat semua statistik" })).toBeNull();
  });
});
