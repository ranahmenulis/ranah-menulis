/**
 * Sprint timer (STD-13, client decision 17 November 2026): write until the time is up, then see
 * how many words the sprint produced. Pure helpers; the timer itself lives in `use-sprint.ts`.
 *
 * A sprint never touches the daily log, so streak, daily target and statistics are unaffected.
 */

export const SPRINT_PRESETS = [10, 15, 25, 45];

/** [usulan] One minute up to three hours. */
export const MIN_SPRINT_MINUTES = 1;
export const MAX_SPRINT_MINUTES = 180;

/** Whole minutes from what the writer typed, or null when it is not a valid duration. */
export function parseMinutes(input: string): number | null {
  const text = input.trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= MIN_SPRINT_MINUTES && n <= MAX_SPRINT_MINUTES ? n : null;
}

/** Time left, never below zero. */
export function remainingMs(startedAt: number, minutes: number, now: number): number {
  return Math.max(0, startedAt + minutes * 60_000 - now);
}

/** "24:31", or "1:05:00" from one hour up. Rounds up so "0:00" only shows when it is over. */
export function formatRemaining(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${minutes}:${two(seconds)}`;
}

/** Words written during the sprint. Deleting more than was written counts as zero, never less. */
export function sprintWords(startWords: number, currentWords: number): number {
  return Math.max(0, currentWords - startWords);
}

/** Minutes spoken aloud: "25 menit", or "1 menit 30 detik" for a sprint stopped early. */
export function spokenDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes === 0) return `${seconds} detik`;
  return seconds === 0 ? `${minutes} menit` : `${minutes} menit ${seconds} detik`;
}

export type SprintState =
  | { phase: "idle" }
  | { phase: "running"; startedAt: number; minutes: number; startWords: number }
  | { phase: "done"; minutes: number; elapsedMs: number; words: number; stopped: boolean };

/** The sentence shown and announced when a sprint ends. */
export function resultText(state: Extract<SprintState, { phase: "done" }>): string {
  const words = new Intl.NumberFormat("id-ID").format(state.words);
  return `${words} kata dalam ${spokenDuration(state.elapsedMs)}`;
}
