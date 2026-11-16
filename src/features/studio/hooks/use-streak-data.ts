"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dayKey, totalWords, type DailyLog } from "../daily-progress";
import { pickLastDocument } from "../documents";
import {
  summarizeStreak,
  targetFor,
  wordsByDay,
  type StreakSummary,
  type TargetChange,
} from "../streak";
import type { DocumentStore, StudioDocument } from "../storage/document-store";
import { readTargets, saveTargets, withTarget } from "../target-setting";

export type StreakData = {
  status: "loading" | "ready" | "error";
  today: string;
  /** When the data was read; relative times are measured from here. */
  nowMs: number;
  history: DailyLog[];
  words: Map<string, number>;
  changes: TargetChange[];
  /** The target in force today, or null when the writer has not set one. */
  target: number | null;
  todayWords: number;
  summary: StreakSummary;
  /** Most recently edited document that is not in Sampah. */
  lastDocument: StudioDocument | null;
  reload: () => void;
  setTarget: (value: number) => void;
};

const noStorage = () => (typeof window === "undefined" ? null : window.localStorage);

/**
 * Everything the Streak tab, the Dokumen tab line and Beranda need, derived from this device's
 * daily logs (steps 4a–c). Becomes server data when the backend exists.
 */
export function useStreakData(store: DocumentStore): StreakData {
  const [status, setStatus] = useState<StreakData["status"]>("loading");
  const [history, setHistory] = useState<DailyLog[]>([]);
  const [docs, setDocs] = useState<StudioDocument[]>([]);
  const [changes, setChanges] = useState<TargetChange[]>([]);
  const [attempt, setAttempt] = useState(0);
  // Read in the effect, not during render: Next prerenders client components, and the date must
  // be the visitor's, not the build's.
  const [today, setToday] = useState("");
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([store.history(), store.list()])
      .then(([logs, list]) => {
        if (cancelled) return;
        setToday(dayKey(new Date()));
        setNowMs(Date.now());
        setHistory(logs);
        setDocs(list);
        setChanges(readTargets(noStorage()));
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [store, attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  const setTarget = useCallback((value: number) => {
    setChanges((current) => {
      const next = withTarget(current, value, dayKey(new Date()));
      saveTargets(noStorage(), next);
      return next;
    });
  }, []);

  return useMemo(() => {
    const words = wordsByDay(history);
    const todayLog = history.find((l) => l.day === today);
    const lastDocument = pickLastDocument(docs);
    return {
      status,
      today,
      nowMs,
      history,
      words,
      changes,
      target: targetFor(changes, today),
      todayWords: todayLog ? totalWords(todayLog) : 0,
      summary: summarizeStreak(words, changes, today),
      lastDocument,
      reload,
      setTarget,
    };
  }, [status, today, nowMs, history, docs, changes, reload, setTarget]);
}
