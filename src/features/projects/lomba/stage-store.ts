"use client";

import { useSyncExternalStore } from "react";
import { stageRank } from "./contest-model";
import type { ContestOverride, ContestOverrides, ContestStage } from "./types";

const KEY = "ranah.contestStages";
const STAGES: ContestStage[] = ["terbuka", "dinilai", "finalis", "pemenang"];

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write; it wins, so the screen shows what was just done. */
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
  // Another tab moved a contest on. A null key means the whole storage was cleared.
  const onStorage = (e: StorageEvent) => (e.key === KEY || e.key === null) && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function isOverride(value: unknown): value is ContestOverride {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    STAGES.includes(v.stage as ContestStage) && typeof v.times === "object" && v.times !== null
  );
}

/** Anything that is not a well-formed record is dropped, so edited data cannot break a page. */
export function parseOverrides(raw: string | null): ContestOverrides {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const result: ContestOverrides = {};
    for (const [slug, value] of Object.entries(parsed)) {
      if (!isOverride(value)) continue;
      const times: ContestOverride["times"] = {};
      for (const step of ["finalis", "pemenang"] as const) {
        const at = (value.times as Record<string, unknown>)[step];
        if (typeof at === "number" && Number.isFinite(at)) times[step] = at;
      }
      result[slug] = { stage: value.stage, times, mine: value.mine === true };
    }
    return result;
  } catch {
    return {};
  }
}

/** Parsed once per stored value, so every screen on the page shares one map. */
let cache: { raw: string | null; map: ContestOverrides } | null = null;
function overridesFor(raw: string | null): ContestOverrides {
  if (cache?.raw !== raw) cache = { raw, map: parseOverrides(raw) };
  return cache.map;
}

/**
 * The stage each contest was pushed to by its Organizer (6g-3c), by slug. Empty on the server and
 * during hydration. The "my work is a finalist" mark was only a development convenience (Juri
 * picks finalists in 6g-4), so a production page never reads it.
 */
export function useContestOverrides(): ContestOverrides {
  const map = overridesFor(useSyncExternalStore(subscribe, snapshot, () => null));
  return process.env.NODE_ENV === "production" ? withoutMarks(map) : map;
}

const stripped = new WeakMap<ContestOverrides, ContestOverrides>();
function withoutMarks(map: ContestOverrides): ContestOverrides {
  let result = stripped.get(map);
  if (!result) {
    result = Object.fromEntries(
      Object.entries(map).map(([slug, o]) => [slug, { ...o, mine: false }]),
    );
    stripped.set(map, result);
  }
  return result;
}

function write(map: ContestOverrides) {
  const next = JSON.stringify(map);
  try {
    window.localStorage.setItem(KEY, next);
    fallback = null;
  } catch {
    fallback = next; // Private mode or storage full: kept for this tab only.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Pushes a contest on to `stage`. An announcement is never taken back (PRD 17.5), so a stage that
 * is not later than the one already pushed changes nothing. The clock is read here, when pressed.
 */
export function advanceContest(slug: string, stage: ContestStage) {
  const current = parseOverrides(snapshot());
  const existing = current[slug];
  if (existing && stageRank(stage) <= stageRank(existing.stage)) return;
  // Every announcement passed on the way gets the moment it was pushed, once.
  const now = Date.now();
  const times = { ...existing?.times };
  for (const step of ["finalis", "pemenang"] as const) {
    if (stageRank(step) <= stageRank(stage) && times[step] === undefined) times[step] = now;
  }
  write({ ...current, [slug]: { stage, times, mine: existing?.mine === true } });
}

/** Makes the reader's own work a finalist of this contest. No screen calls it until Juri exists (6g-4). */
export function markMineFinalist(slug: string) {
  const current = parseOverrides(snapshot());
  const existing = current[slug];
  write({
    ...current,
    [slug]: { stage: existing?.stage ?? "dinilai", times: existing?.times ?? {}, mine: true },
  });
}
