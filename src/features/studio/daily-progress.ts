/**
 * Words written today across all documents (DESIGN.md 5.4). Local only for now; when Streak is
 * built the server becomes the source and this log becomes the offline queue.
 *
 * [konfirmasi] Q-08 / BR-STK-04: deleting text written today reduces the number, never below zero;
 * deleting older text does not. Large pastes are not capped yet because the threshold is undecided.
 */

export type DailyLog = {
  /** "YYYY-MM-DD" as recorded at the time. Older rows used the device zone. */
  day: string;
  docs: Record<string, { title: string; words: number }>;
  activity?: { wordsReduced: number; wordsAddedByHour: Partial<Record<number, number>> };
};

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function emptyLog(date: Date = new Date()): DailyLog {
  return { day: dayKey(date), docs: {} };
}

export function totalWords(log: DailyLog): number {
  return Object.values(log.docs).reduce((sum, d) => sum + d.words, 0);
}

/** Documents with the most words today, largest first. */
export function topDocuments(log: DailyLog, count = 3) {
  return Object.entries(log.docs)
    .map(([id, d]) => ({ id, title: d.title, words: d.words }))
    .filter((d) => d.words > 0)
    .sort((a, b) => b.words - a.words)
    .slice(0, count);
}

/** Record a document going from `previous` to `next` words. Returns a new log. */
export function applyWordDelta(
  log: DailyLog,
  doc: { id: string; title: string },
  previous: number,
  next: number,
): DailyLog {
  const delta = next - previous;
  const current = log.docs[doc.id]?.words ?? 0;
  const words = Math.max(0, current + delta);
  if (words === 0 && !(doc.id in log.docs)) return log;
  return { ...log, docs: { ...log.docs, [doc.id]: { title: doc.title, words } } };
}

/** Record a net change from an accepted writing save, without altering daily progress. */
export function recordWritingActivity(log: DailyLog, delta: number, hour: number): DailyLog {
  if (delta === 0) {
    return log.activity ? log : { ...log, activity: { wordsReduced: 0, wordsAddedByHour: {} } };
  }
  const { wordsReduced, wordsAddedByHour } = log.activity ?? {
    wordsReduced: 0,
    wordsAddedByHour: {},
  };
  const activity =
    delta < 0
      ? { wordsReduced: wordsReduced - delta, wordsAddedByHour }
      : {
          wordsReduced,
          wordsAddedByHour: { ...wordsAddedByHour, [hour]: (wordsAddedByHour[hour] ?? 0) + delta },
        };
  return { ...log, activity };
}
