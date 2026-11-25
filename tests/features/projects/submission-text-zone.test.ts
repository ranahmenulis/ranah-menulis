import { describe, expect, it } from "vitest";
import { sentAtText } from "@/features/projects/submission-text";

describe("sentAtText", () => {
  it("reads the clock in a fixed zone when one is given", () => {
    const at = Date.UTC(2026, 10, 3, 1, 0);
    expect(sentAtText(at, "id", "Asia/Jakarta")).toContain("08.00");
    expect(sentAtText(at, "id", "UTC")).toContain("01.00");
  });
});
