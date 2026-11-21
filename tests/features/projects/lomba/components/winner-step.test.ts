import { describe, expect, it } from "vitest";
import { winnerStep } from "@/features/projects/lomba/components/results-lists";

describe("winnerStep", () => {
  it("brings the first prize in last and pops its label after its row", () => {
    const steps = [0, 1, 2].map((i) => winnerStep(i, 3));
    expect(steps[0].row).toBeGreaterThan(steps[1].row);
    expect(steps[1].row).toBeGreaterThan(steps[2].row);
    // rm-pop waits 120ms + 14ms per step; rm-row-in waits 45ms per step and runs 520ms.
    expect(steps[0].pop * 14 + 120).toBeGreaterThan(steps[0].row * 45 + 300);
  });

  it("starts a single winner at once", () => {
    expect(winnerStep(0, 1).row).toBe(0);
  });
});
