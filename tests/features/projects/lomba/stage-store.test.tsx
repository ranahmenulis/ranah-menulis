import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  advanceContest,
  markMineFinalist,
  parseOverrides,
  useContestOverrides,
} from "@/features/projects/lomba/stage-store";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("parseOverrides", () => {
  it("drops anything that is not a well-formed record", () => {
    expect(parseOverrides(null)).toEqual({});
    expect(parseOverrides("not json")).toEqual({});
    expect(parseOverrides("[]")).toEqual({});
    const raw = JSON.stringify({
      a: { stage: "finalis", times: { finalis: 5, bogus: 1 } },
      b: { stage: "nope", times: {} },
      c: 3,
    });
    expect(Object.keys(parseOverrides(raw))).toEqual(["a"]);
    expect(parseOverrides(raw).a.times).toEqual({ finalis: 5 });
  });
});

describe("advanceContest", () => {
  it("moves a contest on and follows it on every screen", () => {
    const { result } = renderHook(() => useContestOverrides());
    expect(result.current).toEqual({});
    act(() => advanceContest("lomba-a", "finalis"));
    expect(result.current["lomba-a"].stage).toBe("finalis");
  });

  it("records when each announcement was pushed, and keeps the earlier time", () => {
    const { result } = renderHook(() => useContestOverrides());
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1000);
    act(() => advanceContest("lomba-a", "finalis"));
    vi.setSystemTime(2000);
    act(() => advanceContest("lomba-a", "pemenang"));
    vi.useRealTimers();
    expect(result.current["lomba-a"].times).toEqual({ finalis: 1000, pemenang: 2000 });
  });

  it("is empty in production, whatever is stored", () => {
    localStorage.setItem(
      "ranah.contestStages",
      JSON.stringify({ "lomba-a": { stage: "pemenang", times: {}, mine: true } }),
    );
    vi.stubEnv("NODE_ENV", "production");
    const { result } = renderHook(() => useContestOverrides());
    expect(result.current).toEqual({});
    vi.unstubAllEnvs();
  });

  it("never takes an announcement back", () => {
    const { result } = renderHook(() => useContestOverrides());
    act(() => advanceContest("lomba-a", "pemenang"));
    act(() => advanceContest("lomba-a", "finalis"));
    expect(result.current["lomba-a"].stage).toBe("pemenang");
  });

  it("keeps the reader's finalist mark when the stage moves on", () => {
    const { result } = renderHook(() => useContestOverrides());
    act(() => markMineFinalist("lomba-a"));
    act(() => advanceContest("lomba-a", "pemenang"));
    expect(result.current["lomba-a"]).toMatchObject({ stage: "pemenang", mine: true });
  });
});
