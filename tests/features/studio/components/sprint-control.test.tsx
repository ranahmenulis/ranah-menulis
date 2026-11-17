import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SprintAnnouncer, SprintControl } from "@/features/studio/components/sprint-control";
import type { SprintApi } from "@/features/studio/hooks/use-sprint";

afterEach(cleanup);

function api(state: SprintApi["state"], overrides: Partial<SprintApi> = {}): SprintApi {
  return {
    state,
    nowMs: 0,
    start: vi.fn(),
    stop: vi.fn(),
    dismiss: vi.fn(),
    ...overrides,
  };
}

describe("SprintControl", () => {
  it("starts a sprint with the chosen duration and closes the panel", () => {
    const sprint = api({ phase: "idle" });
    const onOpenChange = vi.fn();
    render(<SprintControl sprint={sprint} words={0} open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "45 mnt" }));
    fireEvent.click(screen.getByRole("button", { name: "Mulai sprint" }));

    expect(sprint.start).toHaveBeenCalledWith(45);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("refuses an invalid duration", () => {
    const sprint = api({ phase: "idle" });
    render(<SprintControl sprint={sprint} words={0} open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText("Menit"), { target: { value: "500" } });

    expect(screen.getByText("Isi 1 sampai 180 menit.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mulai sprint" })).toHaveProperty("disabled", true);
  });

  it("shows the time left on the trigger and the words so far inside", () => {
    const sprint = api(
      { phase: "running", startedAt: 0, minutes: 25, startWords: 100 },
      { nowMs: 60_000 },
    );
    render(<SprintControl sprint={sprint} words={250} open onOpenChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Sprint 24:00" })).toBeTruthy();
    expect(screen.getByText("150 kata sejauh ini")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Hentikan sprint" }));
    expect(sprint.stop).toHaveBeenCalled();
  });

  it("keeps the result until it is closed", () => {
    const sprint = api({
      phase: "done",
      minutes: 25,
      elapsedMs: 1_500_000,
      words: 312,
      stopped: false,
    });
    render(<SprintControl sprint={sprint} words={0} open onOpenChange={() => {}} />);

    expect(screen.getByText("312 kata dalam 25 menit")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(sprint.dismiss).toHaveBeenCalled();
  });
});

describe("SprintAnnouncer", () => {
  it("announces the start and the end, and nothing while idle", () => {
    const { rerender } = render(<SprintAnnouncer state={{ phase: "idle" }} />);
    expect(screen.getByRole("status").textContent).toBe("");

    rerender(
      <SprintAnnouncer state={{ phase: "running", startedAt: 0, minutes: 25, startWords: 0 }} />,
    );
    expect(screen.getByRole("status").textContent).toBe("Sprint 25 menit dimulai.");

    rerender(
      <SprintAnnouncer
        state={{ phase: "done", minutes: 25, elapsedMs: 1_500_000, words: 312, stopped: false }}
      />,
    );
    expect(screen.getByRole("status").textContent).toBe("Sprint selesai: 312 kata dalam 25 menit.");
  });
});
