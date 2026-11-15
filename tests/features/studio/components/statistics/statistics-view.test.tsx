import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { StatisticsView } from "@/features/studio/components/statistics/statistics-view";

let data: StreakData;

vi.mock("@/features/studio/hooks/use-streak-data", () => ({ useStreakData: () => data }));
vi.mock("next/navigation", () => ({ usePathname: () => "/studio/statistik" }));

afterEach(cleanup);

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

describe("StatisticsView", () => {
  it("shows the total, the three statistics and the chart for the daily view", () => {
    data = make();
    render(<StatisticsView />);

    expect(screen.getByText("1.512")).toBeTruthy();
    expect(screen.getByText("kata dalam 30 hari terakhir")).toBeTruthy();
    // 12 Nov..15 Nov: today has no words so the average is over 3 days.
    expect(screen.getByText("504")).toBeTruthy();
    expect(screen.getByText("kata, hari terbaik (14 Nov)")).toBeTruthy();
    expect(screen.getByText("dari 3 hari memenuhi target")).toBeTruthy();
    expect(screen.getByRole("group", { name: /^Kata per hari/ })).toBeTruthy();
  });

  it("switches the unit and rebuilds the numbers", () => {
    data = make();
    render(<StatisticsView />);
    const units = screen.getByRole("group", { name: "Satuan waktu" });
    expect(within(units).getByRole("button", { name: "Harian" }).getAttribute("aria-pressed")).toBe(
      "true",
    );

    fireEvent.click(within(units).getByRole("button", { name: "Mingguan" }));
    expect(screen.getByText("kata dalam 12 minggu terakhir")).toBeTruthy();
    expect(screen.getByRole("group", { name: /^Kata per minggu/ })).toBeTruthy();

    fireEvent.click(within(units).getByRole("button", { name: "Bulanan" }));
    expect(screen.getByText("kata dalam 12 bulan terakhir")).toBeTruthy();
  });

  it("offers the same values as a table, newest first", () => {
    data = make();
    render(<StatisticsView />);
    const table = screen.getByRole("table", { name: /Statistik harian, 30 hari terakhir/ });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(31); // header + 30 days
    expect(within(rows[1]).getByRole("rowheader").textContent).toBe("Minggu, 15 November");
    expect(within(rows[2]).getByText("812")).toBeTruthy();
  });

  it("says so, without a threshold, when there is writing only before the range", () => {
    data = make({ words: new Map([["2026-01-02", 400]]) });
    render(<StatisticsView />);
    expect(screen.getByText(/Tidak ada tulisan dalam 30 hari terakhir/)).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("shows one written day as a chart, not as the empty state", () => {
    data = make({ words: new Map([["2026-11-15", 1]]), todayWords: 1 });
    render(<StatisticsView />);
    expect(screen.queryByText(/Belum cukup data/)).toBeNull();
    expect(screen.getByRole("group", { name: /^Kata per hari/ })).toBeTruthy();
  });

  it("without a target compares nothing and does not draw the target key", () => {
    data = make({ changes: [], target: null });
    render(<StatisticsView />);
    expect(screen.getByText("hari memenuhi target, belum ada data")).toBeTruthy();
    expect(screen.queryByText("Target harian")).toBeNull();
  });

  it("invites the first writing when there is none, to the last document if any", () => {
    data = make({ words: new Map() });
    render(<StatisticsView />);
    expect(screen.getByText(/Belum cukup data untuk statistik/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mulai menulis" }).getAttribute("href")).toBe(
      "/studio/baru",
    );
    expect(screen.queryByRole("group", { name: "Satuan waktu" })).toBeNull();
  });

  it("keeps a failed load to a banner with a retry", () => {
    data = make({ status: "error" });
    render(<StatisticsView />);
    fireEvent.click(screen.getByRole("button", { name: /Coba lagi/ }));
    expect(data.reload).toHaveBeenCalledOnce();
    expect(screen.getByText(/Statistik gagal dimuat/)).toBeTruthy();
  });

  it("renders a quiet loading placeholder", () => {
    data = make({ status: "loading" });
    render(<StatisticsView />);
    expect(screen.getByRole("status", { name: "Memuat statistik" })).toBeTruthy();
  });

  it("keeps the Studio tabs with Statistik as the current one", () => {
    data = make();
    render(<StatisticsView />);
    const nav = screen.getByRole("navigation", { name: "Studio" });
    expect(within(nav).getByRole("link", { name: "Statistik" }).getAttribute("aria-current")).toBe(
      "page",
    );
  });
});
