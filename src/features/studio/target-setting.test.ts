import { describe, expect, it } from "vitest";
import { parseTarget, readTargets, saveTargets, withTarget } from "./target-setting";

function memory(initial?: string) {
  const data = new Map<string, string>(initial ? [["ranah.dailyTarget", initial]] : []);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

describe("withTarget", () => {
  it("applies the very first target from today", () => {
    expect(withTarget([], 500, "2026-11-14")).toEqual([{ from: "2026-11-14", value: 500 }]);
  });

  it("applies a later change from tomorrow, keeping today's target", () => {
    const next = withTarget([{ from: "2026-11-01", value: 500 }], 750, "2026-11-14");
    expect(next).toEqual([
      { from: "2026-11-01", value: 500 },
      { from: "2026-11-15", value: 750 },
    ]);
  });

  it("replaces a change that is still pending instead of stacking", () => {
    const once = withTarget([{ from: "2026-11-01", value: 500 }], 750, "2026-11-14");
    const twice = withTarget(once, 1000, "2026-11-14");
    expect(twice.map((c) => c.value)).toEqual([500, 1000]);
  });
});

describe("storage", () => {
  it("round-trips and ignores corrupt data", () => {
    const s = memory();
    saveTargets(s, [{ from: "2026-11-14", value: 500 }]);
    expect(readTargets(s)).toEqual([{ from: "2026-11-14", value: 500 }]);
    expect(readTargets(memory("not json"))).toEqual([]);
    expect(readTargets(memory('[{"from":1,"value":"x"}]'))).toEqual([]);
    expect(readTargets(null)).toEqual([]);
  });
});

describe("parseTarget", () => {
  it.each([
    ["500", 500],
    ["1.000", 1000],
    [" 750 ", 750],
  ])("accepts %s", (input, expected) => expect(parseTarget(input)).toBe(expected));

  it.each(["", "0", "-5", "12,5", "abc", "100001"])("rejects %j", (input) =>
    expect(parseTarget(input)).toBeNull(),
  );
});
