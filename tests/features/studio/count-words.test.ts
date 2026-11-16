import { describe, expect, it } from "vitest";
import { formatClock } from "@/features/studio/count-words";

describe("formatClock", () => {
  it("uses 24-hour time with a dot", () => {
    expect(formatClock(new Date(2026, 10, 15, 14, 2))).toBe("14.02");
  });

  it("renders midnight as 00.00, not 24.00", () => {
    expect(formatClock(new Date(2026, 10, 15, 0, 0))).toBe("00.00");
  });
});
