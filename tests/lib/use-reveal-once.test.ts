import { describe, expect, it } from "vitest";
import { REVEAL_LANES, REVEAL_STEP_MS, revealDelay } from "@/lib/use-reveal-once";

describe("revealDelay", () => {
  it("cascades across one row and starts over, so no tile waits for the whole list", () => {
    expect(revealDelay(0)).toBe(0);
    expect(revealDelay(1)).toBe(REVEAL_STEP_MS);
    expect(revealDelay(REVEAL_LANES)).toBe(0);
    expect(revealDelay(47)).toBeLessThan(REVEAL_LANES * REVEAL_STEP_MS);
  });
});
