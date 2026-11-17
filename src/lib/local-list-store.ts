"use client";

import { useSyncExternalStore } from "react";

/**
 * A small list kept in localStorage and read through `useSyncExternalStore`, until the backend
 * exists. The raw text is parsed once per stored value, so the list keeps its identity between
 * renders. When localStorage refuses a write the value is kept in memory, so the screen still
 * shows what was saved. `initial` is what an untouched store holds; once anything is written the
 * saved list wins, even when it is empty.
 */
export function createLocalListStore<T>(
  key: string,
  isItem: (value: unknown) => value is T,
  initial: readonly T[] = [],
) {
  const NONE: readonly T[] = [];
  const listeners = new Set<() => void>();
  let fallback: string | null = null;
  let cached: { raw: string | null; items: readonly T[] } | null = null;

  function snapshot(): string | null {
    try {
      return fallback ?? window.localStorage.getItem(key);
    } catch {
      return fallback;
    }
  }

  /** Anything that is not a well-formed item is dropped, so old or edited data cannot break a page. */
  function parse(raw: string | null): readonly T[] {
    if (raw === null) return initial.length === 0 ? NONE : initial;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return NONE;
      const items = parsed.filter(isItem);
      return items.length === 0 ? NONE : items;
    } catch {
      return NONE;
    }
  }

  function read(): readonly T[] {
    const raw = snapshot();
    if (!cached || cached.raw !== raw) cached = { raw, items: parse(raw) };
    return cached.items;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => (e.key === key || e.key === null) && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function write(items: readonly T[]) {
    const raw = JSON.stringify(items);
    try {
      window.localStorage.setItem(key, raw);
      fallback = null;
    } catch {
      fallback = raw;
    }
    listeners.forEach((l) => l());
  }

  return {
    /** The list now, outside React (button handlers and tests). */
    read,
    write,
    use: () => useSyncExternalStore(subscribe, read, () => (initial.length === 0 ? NONE : initial)),
    /** Forget everything, including the in-memory copy (tests). */
    reset() {
      fallback = null;
      cached = null;
      try {
        window.localStorage.removeItem(key);
      } catch {}
      listeners.forEach((l) => l());
    },
  };
}
