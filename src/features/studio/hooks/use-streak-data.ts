"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "@/features/account/account-store";
import { totalWords, type DailyLog } from "../daily-progress";
import { pickLastDocument } from "../documents";
import {
  summarizeStreak,
  targetFor,
  wordsByDay,
  type StreakSummary,
  type TargetChange,
} from "../streak";
import type { DocumentStore, DocumentSummary } from "../storage/document-store";
import { onDocumentListChanged } from "../storage/document-events";
import { readTargets, saveTargets, withTarget } from "../target-setting";
import { writingTime } from "../writing-time";

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
  /** Most recently edited active document. */
  lastDocument: DocumentSummary | null;
  reload: () => void;
  setTarget: (value: number) => void;
};

const noStorage = () => (typeof window === "undefined" ? null : window.localStorage);

/**
 * Everything the Streak tab, the Dokumen tab line and Beranda need, derived from this device's
 * daily logs (steps 4a–c). Becomes server data when the backend exists.
 */
export function useStreakData(store: DocumentStore): StreakData {
  const { timeZone } = useAccount().profile;
  const [status, setStatus] = useState<StreakData["status"]>("loading");
  const [history, setHistory] = useState<DailyLog[]>([]);
  const [lastDocument, setLastDocument] = useState<DocumentSummary | null>(null);
  const [changes, setChanges] = useState<TargetChange[]>([]);
  const [attempt, setAttempt] = useState(0);
  // Read in the effect, not during render: Next prerenders client components, and the date must
  // be the visitor's, not the build's.
  const [nowMs, setNowMs] = useState(0);
  const today = nowMs ? writingTime(nowMs, timeZone).day : "";

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([store.history(), store.listSummaries(signal)])
      .then(([logs, list]) => {
        if (signal.aborted) return;
        setNowMs(Date.now());
        setHistory(logs);
        setLastDocument(pickLastDocument(list));
        setChanges(readTargets(noStorage()));
        setStatus("ready");
      })
      .catch(() => !signal.aborted && setStatus("error"));
    return () => controller.abort();
  }, [store, attempt]);

  useEffect(() => onDocumentListChanged(() => setAttempt((value) => value + 1)), []);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  const setTarget = useCallback(
    (value: number) => {
      setChanges((current) => {
        const next = withTarget(current, value, writingTime(Date.now(), timeZone).day);
        saveTargets(noStorage(), next);
        return next;
      });
    },
    [timeZone],
  );

  return useMemo(() => {
    const words = wordsByDay(history);
    const todayLog = history.find((l) => l.day === today);
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
  }, [status, today, nowMs, history, lastDocument, changes, reload, setTarget]);
}
