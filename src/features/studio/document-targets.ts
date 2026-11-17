import { addDays, parseDay } from "./streak";

/**
 * Targets on one document (STK-08, client decision 17 November 2026): a word count to reach and an
 * optional due day, several per document. They belong to the document and are private with it.
 * Progress is the document's total words and is derived, never stored. Targets do not touch the
 * daily target, the streak or the statistics (BR-STK-10).
 *
 * [usulan] At most 5 per document, 1 to 500,000 words, a due day of today or later.
 */
export type DocumentTarget = {
  id: string;
  words: number;
  /** "YYYY-MM-DD" in the writer's local time zone, or absent for no deadline. */
  due?: string | null;
};

export const MAX_TARGETS = 5;
export const MAX_TARGET_WORDS = 500_000;

export type TargetStatus = "tercapai" | "terlewat" | "berjalan";

const number = new Intl.NumberFormat("id-ID");

/** Whole words from what the writer typed, or null when it is not a valid target. */
export function parseTargetWords(input: string): number | null {
  const n = Number(input.replace(/[.\s]/g, ""));
  return Number.isInteger(n) && n >= 1 && n <= MAX_TARGET_WORDS ? n : null;
}

function isDayKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Stored data can be edited by hand; anything that is not a valid target is dropped. */
export function sanitizeTargets(raw: unknown): DocumentTarget[] {
  if (!Array.isArray(raw)) return [];
  const result: DocumentTarget[] = [];
  for (const item of raw) {
    if (typeof item?.id !== "string" || !Number.isInteger(item?.words)) continue;
    if (item.words < 1 || item.words > MAX_TARGET_WORDS) continue;
    const due = typeof item.due === "string" && isDayKey(item.due) ? item.due : null;
    result.push({ id: item.id, words: item.words, due });
  }
  return result.slice(0, MAX_TARGETS);
}

export type AddFailure = "limit" | "due" | "duplicate";

/** Adds a target, or says why not. A due day in the past is refused when the target is created. */
export function addTarget(
  list: DocumentTarget[],
  target: DocumentTarget,
  today: string,
): { ok: true; list: DocumentTarget[] } | { ok: false; reason: AddFailure } {
  if (list.length >= MAX_TARGETS) return { ok: false, reason: "limit" };
  if (target.due && (!isDayKey(target.due) || target.due < today)) {
    return { ok: false, reason: "due" };
  }
  const same = (t: DocumentTarget) =>
    t.words === target.words && (t.due ?? null) === (target.due ?? null);
  if (list.some(same)) return { ok: false, reason: "duplicate" };
  return { ok: true, list: [...list, target] };
}

export function removeTarget(list: DocumentTarget[], id: string): DocumentTarget[] {
  return list.filter((t) => t.id !== id);
}

/** Soonest due day first, targets without a due day last, then the smaller target first. */
export function sortTargets(list: DocumentTarget[]): DocumentTarget[] {
  return [...list].sort((a, b) => {
    if (a.due && b.due && a.due !== b.due) return a.due.localeCompare(b.due);
    if (a.due && !b.due) return -1;
    if (!a.due && b.due) return 1;
    return a.words - b.words;
  });
}

export function targetStatus(target: DocumentTarget, words: number, today: string): TargetStatus {
  if (words >= target.words) return "tercapai";
  return target.due && target.due < today ? "terlewat" : "berjalan";
}

/** Days from today to the due day; negative once it has passed. */
export function daysLeft(due: string, today: string): number {
  return Math.round((parseDay(due).getTime() - parseDay(today).getTime()) / 86_400_000);
}

export function dueLabel(due: string, today: string): string {
  const days = daysLeft(due, today);
  if (days === 0) return "tenggat hari ini";
  if (days === 1) return "tenggat besok";
  return days > 0 ? `${days} hari lagi` : `terlewat ${-days} hari`;
}

/** Progress as the writer reads it: "320 / 1.000 kata · 5 hari lagi". */
export function targetLine(target: DocumentTarget, words: number, today: string): string {
  const base = `${number.format(Math.min(words, target.words))} / ${number.format(target.words)} kata`;
  if (words >= target.words) return `${base} · tercapai`;
  return target.due ? `${base} · ${dueLabel(target.due, today)}` : base;
}

/**
 * The target worth mentioning in a list: the nearest one still being worked on, else the one most
 * recently missed. Null when every target is reached or there are none.
 */
export function nearestTarget(
  list: DocumentTarget[],
  words: number,
  today: string,
): DocumentTarget | null {
  const open = sortTargets(list).filter((t) => targetStatus(t, words, today) !== "tercapai");
  return (
    open.find((t) => targetStatus(t, words, today) === "berjalan") ?? [...open].reverse()[0] ?? null
  );
}

/** One line for the document list and the counter, or null when there is nothing to show. */
export function targetSummary(raw: unknown, words: number, today: string): string | null {
  const nearest = nearestTarget(sanitizeTargets(raw), words, today);
  return nearest ? targetLine(nearest, words, today) : null;
}

/** The day the dialog offers as the earliest due day. */
export const tomorrow = (today: string) => addDays(today, 1);
