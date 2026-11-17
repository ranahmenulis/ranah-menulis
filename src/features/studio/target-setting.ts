import { addDays, type TargetChange } from "./streak";

const KEY = "ranah.dailyTarget";

/** [konfirmasi] STK-01: shown until the writer picks their own. */
export const DEFAULT_TARGET = 500;
export const TARGET_PRESETS = [250, 500, 1000, 2000, 5000];

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

export function readTargets(storage: Storage | null): TargetChange[] {
  try {
    const raw = storage?.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is TargetChange =>
        typeof c?.from === "string" && Number.isInteger(c?.value) && c.value > 0,
    );
  } catch {
    return [];
  }
}

/**
 * Record a new target. It applies from tomorrow, so today's progress is judged by the target the
 * writer started the day with (PRD STK-01). Setting it again today replaces the pending change.
 * The very first target applies from today, so a new writer is counted straight away.
 */
export function withTarget(changes: TargetChange[], value: number, today: string): TargetChange[] {
  const from = changes.length === 0 ? today : addDays(today, 1);
  return [...changes.filter((c) => c.from <= today), { from, value }];
}

export function saveTargets(storage: Storage | null, changes: TargetChange[]) {
  try {
    storage?.setItem(KEY, JSON.stringify(changes));
  } catch {
    // Private mode or storage full: the target simply is not remembered.
  }
}

/** A target is a whole number of words, 1 to 100,000. [konfirmasi] upper bound. */
export function parseTarget(input: string): number | null {
  const n = Number(input.replace(/[.\s]/g, ""));
  return Number.isInteger(n) && n >= 1 && n <= 100_000 ? n : null;
}
