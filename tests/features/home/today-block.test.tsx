import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { ProgressSection, TodayCard } from "@/features/home/today-block";

afterEach(cleanup);

const doc: StudioDocument = {
  id: "d1",
  title: "Yang Ditunggu Nenek di Bawah Jambu Air",
  content: { type: "doc" },
  wordCount: 167,
  version: 1,
  updatedAt: 1_000_000,
};

function data(over: Partial<StreakData> = {}): StreakData {
  return {
    status: "ready",
    today: "2026-11-14",
    nowMs: 1_000_000 + 40 * 60_000,
    history: [],
    words: new Map(),
    changes: [],
    target: 500,
    todayWords: 320,
    summary: { current: 6, longest: null, last: null },
    lastDocument: doc,
    reload: vi.fn(),
    setTarget: vi.fn(),
    ...over,
  };
}

describe("TodayCard", () => {
  it("offers to continue the last document, with its words and age", () => {
    render(<TodayCard data={data()} showSteps={false} />);

    expect(screen.getByText(doc.title)).toBeTruthy();
    expect(screen.getByText(/167 kata · diubah 40 menit lalu · Pribadi/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lanjutkan" }).getAttribute("href")).toBe("/studio/d1");
  });

  it("has exactly one filled button", () => {
    render(<TodayCard data={data()} showSteps={false} />);
    const filled = screen.getAllByRole("link").filter((a) => a.className.includes("bg-ink"));
    expect(filled).toHaveLength(1);
  });

  it("invites the first document when there is none", () => {
    render(<TodayCard data={data({ lastDocument: null })} showSteps={false} />);
    expect(screen.getByText("Belum ada dokumen.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mulai menulis" }).getAttribute("href")).toBe(
      "/studio/baru",
    );
  });

  it("shows the first steps instead, so no action appears twice", () => {
    render(<TodayCard data={data({ lastDocument: null, target: null })} showSteps />);
    expect(screen.getByRole("list", { name: "Tiga langkah awal" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Mulai menulis" })).toBeNull();
  });

  it("shows a banner with a retry for a failed load, without touching other blocks", () => {
    const reload = vi.fn();
    render(<TodayCard data={data({ status: "error", reload })} showSteps={false} />);

    expect(screen.getByRole("alert").textContent).toContain("Hari ini gagal dimuat");
    screen.getByRole("button", { name: "Coba lagi" }).click();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("renders a quiet loading placeholder", () => {
    render(<TodayCard data={data({ status: "loading" })} showSteps={false} />);
    expect(screen.getByRole("status", { name: "Memuat Hari ini" })).toBeTruthy();
  });
});

describe("ProgressSection", () => {
  it("shows today's progress as a link to Streak", () => {
    render(<ProgressSection data={data()} />);
    const link = screen.getByRole("link", {
      name: /Progres hari ini 320 dari 500 kata, streak 6 hari/,
    });
    expect(link.getAttribute("href")).toBe("/studio/streak");
  });

  it("asks for a target instead of showing a bar when none is set", () => {
    render(<ProgressSection data={data({ target: null })} />);
    expect(screen.getByText("Belum ada target harian.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tetapkan target" }).getAttribute("href")).toBe(
      "/studio/streak",
    );
    expect(screen.queryByRole("link", { name: /Progres hari ini/ })).toBeNull();
  });

  it("adds the three word totals once there is writing", () => {
    const words = new Map([["2026-11-14", 320]]);
    render(<ProgressSection data={data({ words })} />);
    expect(screen.getByText("Minggu ini").nextElementSibling?.textContent).toContain("320");
  });

  it("is not drawn before the data is ready", () => {
    const { container } = render(<ProgressSection data={data({ status: "loading" })} />);
    expect(container.firstChild).toBeNull();
  });
});
