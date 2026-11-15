import { describe, expect, it } from "vitest";
import { totalWords } from "@/features/studio/daily-progress";
import { buildSampleHistory } from "@/features/studio/sample-history";

describe("buildSampleHistory", () => {
  it("covers the 30 days before today, never today, skipping empty days", () => {
    const logs = buildSampleHistory("2026-11-14");
    expect(logs.every((l) => l.day < "2026-11-14")).toBe(true);
    expect(logs.at(-1)!.day).toBe("2026-11-13");
    expect(logs.length).toBeGreaterThan(20);
    expect(logs.every((l) => totalWords(l) > 0)).toBe(true);
  });
});
