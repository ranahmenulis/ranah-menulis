import type { DailyLog } from "./daily-progress";

export type WritingMetrics = {
  pace: number | null;
  favoriteDay: number | null;
  favoriteHour: number | null;
  wordsReduced: number | null;
};

/** Keeps the first index on a tie. Empty buckets do not produce a favorite. */
function favorite(counts: number[]): number | null {
  const highest = Math.max(...counts);
  return highest > 0 ? counts.indexOf(highest) : null;
}

/** From the same date range as the chart, using the date and hour stored at save time. */
export function writingMetrics(
  words: ReadonlyMap<string, number>,
  history: readonly DailyLog[],
  start: string,
  end: string,
): WritingMetrics {
  const writingDays = Array<number>(7).fill(0);
  const wordsByHour = Array<number>(24).fill(0);
  let activeDays = 0;
  let totalWords = 0;
  let wordsReduced: number | null = null;

  for (const [day, count] of words) {
    if (day < start || day > end || count <= 0) continue;
    const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
    writingDays[(weekday + 6) % 7]++;
    activeDays++;
    totalWords += count;
  }

  for (const { day, activity } of history) {
    if (!activity || day < start || day > end) continue;
    wordsReduced = (wordsReduced ?? 0) + activity.wordsReduced;
    for (let hour = 0; hour < 24; hour++) {
      wordsByHour[hour] += activity.wordsAddedByHour[hour] ?? 0;
    }
  }

  return {
    pace: activeDays ? Math.round(totalWords / activeDays) : null,
    favoriteDay: favorite(writingDays),
    favoriteHour: favorite(wordsByHour),
    wordsReduced,
  };
}
