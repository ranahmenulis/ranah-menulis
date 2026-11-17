"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_SPRINT_MINUTES, MIN_SPRINT_MINUTES, sprintWords, type SprintState } from "../sprint";

export type SprintApi = {
  state: SprintState;
  /** The time the display was last refreshed; 0 until a sprint has started. */
  nowMs: number;
  start: (minutes: number) => void;
  /** End the sprint early; the result still shows. */
  stop: () => void;
  /** Close the result and go back to the start form. */
  dismiss: () => void;
};

/**
 * Sprint timer. It is not saved: closing or reloading the page ends it (client decision 17
 * November 2026). Time comes from timestamps, not from counting ticks, so a throttled background
 * tab cannot drift. `words` is the live word count of the document; the hook has no access to any
 * store, so a sprint cannot change the daily log.
 */
export function useSprint(words: number): SprintApi {
  const [state, setState] = useState<SprintState>({ phase: "idle" });
  const [nowMs, setNowMs] = useState(0);
  const wordsRef = useRef(words);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  const finish = useCallback((stopped: boolean) => {
    setState((current) => {
      if (current.phase !== "running") return current;
      const elapsed = Math.min(Date.now() - current.startedAt, current.minutes * 60_000);
      return {
        phase: "done",
        minutes: current.minutes,
        elapsedMs: stopped ? elapsed : current.minutes * 60_000,
        words: sprintWords(current.startWords, wordsRef.current),
        stopped,
      };
    });
  }, []);

  const running = state.phase === "running";
  const startedAt = state.phase === "running" ? state.startedAt : 0;
  const minutes = state.phase === "running" ? state.minutes : 0;
  useEffect(() => {
    if (!running) return;
    const end = startedAt + minutes * 60_000;
    const tick = () => (Date.now() >= end ? finish(false) : setNowMs(Date.now()));
    const interval = window.setInterval(tick, 1000);
    // The end is scheduled exactly, so the result does not arrive up to a second late.
    const timeout = window.setTimeout(tick, Math.max(0, end - Date.now()));
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running, startedAt, minutes, finish]);

  const start = useCallback((requested: number) => {
    const clamped = Math.min(MAX_SPRINT_MINUTES, Math.max(MIN_SPRINT_MINUTES, requested));
    const now = Date.now();
    setNowMs(now);
    setState({ phase: "running", startedAt: now, minutes: clamped, startWords: wordsRef.current });
  }, []);

  const stop = useCallback(() => finish(true), [finish]);
  const dismiss = useCallback(() => setState({ phase: "idle" }), []);

  return { state, nowMs, start, stop, dismiss };
}
