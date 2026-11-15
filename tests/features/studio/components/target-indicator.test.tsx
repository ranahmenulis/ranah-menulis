import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { applyWordDelta, emptyLog } from "@/features/studio/daily-progress";
import { TargetIndicator } from "@/features/studio/components/target-indicator";

afterEach(cleanup);

function log(words: Record<string, number>) {
  return Object.entries(words).reduce(
    (acc, [title, n]) => applyWordDelta(acc, { id: title, title }, 0, n),
    emptyLog(),
  );
}

describe("TargetIndicator", () => {
  it("shows today's words against the target and is named for screen readers", () => {
    render(<TargetIndicator target={500} progress={log({ Surat: 468 })} pending={false} />);

    const button = screen.getByRole("button", {
      name: /Kata hari ini dari semua dokumen: 468 dari target 500/,
    });
    expect(button.textContent).toContain("468 / 500");
    expect(button.textContent).toContain("hari ini");
  });

  it("keeps counting past the target without a new message", () => {
    render(<TargetIndicator target={500} progress={log({ Surat: 612 })} pending={false} />);
    expect(screen.getByRole("button").textContent).toContain("612 / 500");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("marks words as recorded later while offline", () => {
    render(<TargetIndicator target={500} progress={log({ Surat: 471 })} pending />);
    expect(screen.getByRole("button").textContent).toContain("tercatat saat tersambung");
  });

  it("opens a popover with the remaining words and the top three documents", () => {
    render(
      <TargetIndicator
        target={500}
        progress={log({ A: 10, B: 300, C: 50, D: 80 })}
        pending={false}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    const popover = screen.getByRole("dialog", { name: "Kata hari ini" });
    expect(popover.textContent).toContain("60 kata lagi untuk target hari ini.");
    const rows = Array.from(popover.querySelectorAll("li")).map((li) => li.textContent);
    expect(rows).toEqual(["B300", "D80", "C50"]);
  });

  it("handles zero words with no document rows", () => {
    render(<TargetIndicator target={500} progress={emptyLog()} pending={false} />);
    fireEvent.click(screen.getByRole("button"));

    const popover = screen.getByRole("dialog");
    expect(popover.textContent).toContain("500 kata lagi");
    expect(popover.querySelectorAll("li")).toHaveLength(0);
  });
});
