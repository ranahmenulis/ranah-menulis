"use client";

import { useSyncExternalStore } from "react";

const KEY = "ranah.firstStepsDismissed";

const listeners = new Set<() => void>();

/** Set when localStorage refused the write, so the card still goes away on this page. */
let fallback = false;

function snapshot(): boolean {
  try {
    return fallback || window.localStorage.getItem(KEY) === "1";
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab closed the card. A null key means the whole storage was cleared.
  const onStorage = (e: StorageEvent) => (e.key === KEY || e.key === null) && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Whether the writer closed the first-steps card (client decision 17 November 2026). */
export function useFirstStepsDismissed(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

/** Closing is final: there is deliberately no way to bring the card back. */
export function dismissFirstSteps() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    fallback = true;
  }
  for (const listener of listeners) listener();
}

/** Test helper: forget the in-memory fallback. */
export function resetFirstStepsFallback() {
  fallback = false;
}
