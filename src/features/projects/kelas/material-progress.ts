"use client";

import { useSyncExternalStore } from "react";

const KEY = "ranah.classProgress";

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write; it wins, so the screen shows what was just marked. */
let fallback: string | null = null;

export type Marks = Record<string, string[]>;

function snapshot(): string | null {
  try {
    return fallback ?? window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab marked a material. A null key means the whole storage was cleared.
  const onStorage = (e: StorageEvent) => (e.key === KEY || e.key === null) && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Anything that is not a map of lists of strings is dropped, so edited data cannot break a page. */
export function parseMarks(raw: string | null): Marks {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const result: Marks = {};
    for (const [slug, ids] of Object.entries(parsed)) {
      if (Array.isArray(ids))
        result[slug] = ids.filter((id): id is string => typeof id === "string");
    }
    return result;
  } catch {
    return {};
  }
}

/** Parsed once per stored value, so every screen on the page shares one map. */
let cache: { raw: string | null; marks: Marks } | null = null;
function marksFor(raw: string | null): Marks {
  if (cache?.raw !== raw) cache = { raw, marks: parseMarks(raw) };
  return cache.marks;
}

const EMPTY: ReadonlySet<string> = new Set();
const sets = new WeakMap<string[], ReadonlySet<string>>();

/**
 * Materials this reader marked as done in one class, by id. Kept on this device (KLS-02: progress
 * counts the materials marked done). Empty on the server and during hydration.
 */
export function useDoneMaterials(slug: string): ReadonlySet<string> {
  const ids = marksFor(useSyncExternalStore(subscribe, snapshot, () => null))[slug];
  if (!ids) return EMPTY;
  let set = sets.get(ids);
  if (!set) {
    set = new Set(ids);
    sets.set(ids, set);
  }
  return set;
}

/** Every class's marks at once, for screens that look across classes (Lanjutkan on Beranda). */
export function useDoneMarks(): Marks {
  return marksFor(useSyncExternalStore(subscribe, snapshot, () => null));
}

/** Marks or unmarks one material. Reads the stored value again, so two tabs do not overwrite. */
export function setMaterialDone(slug: string, materialId: string, done: boolean) {
  const marks = parseMarks(snapshot());
  const current = new Set(marks[slug] ?? []);
  if (done === current.has(materialId)) return;
  if (done) current.add(materialId);
  else current.delete(materialId);
  write({ ...marks, [slug]: [...current] });
}

function write(marks: Marks) {
  const next = JSON.stringify(marks);
  try {
    window.localStorage.setItem(KEY, next);
    fallback = null;
  } catch {
    fallback = next; // Private mode or storage full: kept for this tab only.
  }
  listeners.forEach((listener) => listener());
}
