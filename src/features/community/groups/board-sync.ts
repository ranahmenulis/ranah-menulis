import { totalWords, type DailyLog } from "@/features/studio/daily-progress";
import type { CircleWords } from "./group-model";

/** The days a member wrote, from their own Studio history, from `since` on. Days with no words are left out. */
export function ownDays(
  history: readonly DailyLog[],
  since: string,
): { day: string; words: number }[] {
  return history
    .filter((log) => log.day >= since)
    .map((log) => ({ day: log.day, words: totalWords(log) }))
    .filter((entry) => entry.words > 0)
    .sort((a, b) => a.day.localeCompare(b.day));
}

/**
 * Replaces one membership's rows with `days`, leaving everyone else's rows alone. Returns the same
 * array when nothing differs, so a caller can skip the write.
 */
export function mergeOwnWords(
  existing: readonly CircleWords[],
  authorId: string,
  membershipId: string,
  days: readonly { day: string; words: number }[],
): readonly CircleWords[] {
  const mine = (row: CircleWords) => row.authorId === authorId && row.membershipId === membershipId;
  const current = existing.filter(mine);
  const same =
    current.length === days.length &&
    days.every((d) => current.some((row) => row.day === d.day && row.words === d.words));
  if (same) return existing;
  return [
    ...existing.filter((row) => !mine(row)),
    ...days.map((d) => ({ authorId, membershipId, day: d.day, words: d.words })),
  ];
}
