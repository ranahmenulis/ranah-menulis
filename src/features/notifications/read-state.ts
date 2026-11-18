"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "ranah.notificationsRead";

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so the screen still reflects what was read. */
let fallback: string | null = null;

function snapshot(): string | null {
  try {
    return fallback ?? window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changed the read state.
  const onStorage = (e: StorageEvent) => (e.key === KEY || e.key === null) && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function parseReadIds(raw: string | null): ReadonlySet<string> {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

/** Ids the reader has read on this device. Empty on the server and during hydration. */
export function useReadIds(): ReadonlySet<string> {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parseReadIds(raw), [raw]);
}

/** Marks notifications as read. Writing again with ids already stored changes nothing. */
export function markRead(ids: readonly string[]) {
  const next = JSON.stringify([...new Set([...parseReadIds(snapshot()), ...ids])]);
  try {
    window.localStorage.setItem(KEY, next);
    fallback = null;
  } catch {
    fallback = next; // Private mode or storage full: kept for this tab only.
  }
  listeners.forEach((listener) => listener());
}
