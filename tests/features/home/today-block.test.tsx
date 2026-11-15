import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { TodayBlock } from "@/features/home/today-block";

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

describe("TodayBlock", () => {
  it("offers to continue the last document, with its words and age", () => {
    render(<TodayBlock data={data()} showDummy={false} />);

    expect(screen.getByText(doc.title)).toBeTruthy();
    expect(screen.getByText(/167 kata · diubah 40 menit lalu · Pribadi/)).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Lanjutkan/ })[0].getAttribute("href")).toBe(
      "/studio/d1",
    );
  });

  it("shows today's progress as a link to Streak", () => {
    render(<TodayBlock data={data()} showDummy={false} />);
    const link = screen.getByRole("link", {
      name: /Progres hari ini 320 dari 500 kata, streak 6 hari/,
    });
    expect(link.getAttribute("href")).toBe("/studio/streak");
  });

  it("invites the first document when there is none", () => {
    render(<TodayBlock data={data({ lastDocument: null })} showDummy={false} />);
    expect(screen.getByText("Belum ada dokumen.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mulai menulis" }).getAttribute("href")).toBe(
      "/studio/baru",
    );
  });

  it("asks for a target instead of showing a bar when none is set", () => {
    render(<TodayBlock data={data({ target: null })} showDummy={false} />);
    expect(screen.getByText("Belum ada target harian.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Progres hari ini/ })).toBeNull();
  });

  it("draws the dummy rows only when asked, and never more than one filled button", () => {
    const { rerender } = render(<TodayBlock data={data()} showDummy={false} />);
    expect(screen.queryByText("Perlu perhatian")).toBeNull();

    rerender(<TodayBlock data={data()} showDummy />);
    expect(screen.getByText("Perlu perhatian")).toBeTruthy();
    expect(screen.getByText("Proyek saya")).toBeTruthy();
    const filled = screen.getAllByRole("link").filter((a) => a.className.includes("bg-ink"));
    expect(filled).toHaveLength(1);
  });

  it("shows a banner with a retry for a failed load, without touching other blocks", () => {
    const reload = vi.fn();
    render(<TodayBlock data={data({ status: "error", reload })} showDummy={false} />);

    expect(screen.getByRole("alert").textContent).toContain("Hari ini gagal dimuat");
    screen.getByRole("button", { name: "Coba lagi" }).click();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("renders a quiet loading placeholder", () => {
    render(<TodayBlock data={data({ status: "loading" })} showDummy={false} />);
    expect(screen.getByRole("status", { name: "Memuat Hari ini" })).toBeTruthy();
  });
});
