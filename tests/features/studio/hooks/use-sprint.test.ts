import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSprint } from "@/features/studio/hooks/use-sprint";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-18T10:00:00"));
});
afterEach(() => vi.useRealTimers());

describe("useSprint", () => {
  it("starts idle, runs, and ends by itself with the words written meanwhile", () => {
    const { result, rerender } = renderHook(({ words }) => useSprint(words), {
      initialProps: { words: 100 },
    });
    expect(result.current.state.phase).toBe("idle");

    act(() => result.current.start(10));
    expect(result.current.state).toMatchObject({ phase: "running", minutes: 10, startWords: 100 });

    rerender({ words: 460 });
    act(() => {
      vi.advanceTimersByTime(10 * 60_000);
    });

    expect(result.current.state).toEqual({
      phase: "done",
      minutes: 10,
      elapsedMs: 10 * 60_000,
      words: 360,
      stopped: false,
    });
  });

  it("stops early and reports the time actually spent", () => {
    const { result, rerender } = renderHook(({ words }) => useSprint(words), {
      initialProps: { words: 0 },
    });
    act(() => result.current.start(25));
    rerender({ words: 80 });
    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    act(() => result.current.stop());

    expect(result.current.state).toMatchObject({
      phase: "done",
      stopped: true,
      words: 80,
      elapsedMs: 90_000,
    });
  });

  it("does not count negative words when text was deleted", () => {
    const { result, rerender } = renderHook(({ words }) => useSprint(words), {
      initialProps: { words: 500 },
    });
    act(() => result.current.start(1));
    rerender({ words: 200 });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.state).toMatchObject({ phase: "done", words: 0 });
  });

  it("clamps the duration and returns to idle when dismissed", () => {
    const { result } = renderHook(() => useSprint(0));
    act(() => result.current.start(999));
    expect(result.current.state).toMatchObject({ minutes: 180 });
    act(() => result.current.stop());
    act(() => result.current.dismiss());
    expect(result.current.state.phase).toBe("idle");
  });
});
