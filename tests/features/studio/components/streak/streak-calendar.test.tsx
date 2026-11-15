import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { applyWordDelta, emptyLog, type DailyLog } from "@/features/studio/daily-progress";
import { wordsByDay } from "@/features/studio/streak";
import { StreakCalendar } from "@/features/studio/components/streak/streak-calendar";

afterEach(cleanup);

const changes = [{ from: "2026-10-01", value: 500 }];

function log(day: string, docs: Record<string, number>): DailyLog {
  return Object.entries(docs).reduce(
    (acc, [title, n]) => applyWordDelta(acc, { id: title, title }, 0, n),
    { ...emptyLog(), day },
  );
}

const history = [
  log("2026-11-12", { "Surat untuk Kakek": 600 }),
  log("2026-11-13", { "Pasar Pagi": 40 }),
];

function setup() {
  return render(
    <StreakCalendar
      today="2026-11-14"
      words={wordsByDay(history)}
      history={history}
      changes={changes}
      celebrate={false}
    />,
  );
}

describe("StreakCalendar", () => {
  it("shows the current month, weeks starting Monday", () => {
    setup();
    expect(screen.getByRole("heading", { name: "November 2026" })).toBeTruthy();
    expect(screen.getByRole("grid").getAttribute("aria-label")).toContain("minggu mulai Senin");
  });

  it("describes each day for screen readers: date, words, and whether the target was met", () => {
    setup();
    expect(screen.getByRole("button", { name: "12 Nov, 600 kata, target tercapai" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "13 Nov, 40 kata" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "11 Nov, kosong" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "14 Nov, hari ini, kosong" }).getAttribute("aria-current"),
    ).toBe("date");
  });

  it("does not let you pick a future day", () => {
    setup();
    expect((screen.getByRole("button", { name: "15 Nov" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("shows words per document for the picked day", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "12 Nov, 600 kata, target tercapai" }));

    const list = screen.getByRole("list", { name: "Kata per dokumen" });
    expect(list.textContent).toContain("Surat untuk Kakek");
    expect(list.textContent).toContain("600");
    expect(screen.getByRole("status").textContent).toContain("target tercapai");
  });

  it("can go back a month but not past the current one", () => {
    setup();
    const next = screen.getByRole("button", { name: "Bulan berikutnya" }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Bulan sebelumnya" }));

    expect(screen.getByRole("heading", { name: "Oktober 2026" })).toBeTruthy();
    expect(next.disabled).toBe(false);
    expect(screen.getByText("Belum ada tulisan bulan ini.")).toBeTruthy();
  });
});
