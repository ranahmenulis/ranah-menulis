import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { countFrame, useCountUp } from "@/lib/use-count-up";

describe("countFrame", () => {
  it("starts at the old value and ends at the new one", () => {
    expect(countFrame(0, 500, 0)).toBe(0);
    expect(countFrame(0, 500, 1)).toBe(500);
    expect(countFrame(200, 100, 1)).toBe(100);
  });

  it("eases out and clamps time", () => {
    expect(countFrame(0, 100, 0.5)).toBe(88);
    expect(countFrame(0, 100, -1)).toBe(0);
    expect(countFrame(0, 100, 3)).toBe(100);
  });
});

describe("useCountUp", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("is the value at once when motion is not allowed", () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
      initialProps: { v: 1512 },
    });
    expect(result.current).toBe(1512);
    rerender({ v: 40 });
    expect(result.current).toBe(40);
  });

  it("rolls up from zero when motion is allowed", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { result } = renderHook(() => useCountUp(300, 900));
    expect(result.current).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(300);
  });
});
