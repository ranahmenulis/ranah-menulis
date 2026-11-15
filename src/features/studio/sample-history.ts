import { addDays } from "./streak";
import type { DailyLog } from "./daily-progress";

/** Words per day, oldest to newest, 0 = no writing. Mirrors the design board's sample month. */
const PATTERN = [
  540, 510, 230, 620, 0, 505, 180, 520, 520, 610, 505, 812, 540, 0, 0, 480, 530, 0, 510, 505, 700,
  90, 520, 515, 0, 510, 560, 505, 530, 612,
];
const TITLES = ["Surat untuk Kakek di Pelabuhan", "Pasar Pagi di Bukittinggi", "Daftar nama tokoh"];

/**
 * Sample writing history for the 30 days before `today` (not today, which stays real). Development
 * aid for looking at the Streak calendar without writing for a month.
 */
export function buildSampleHistory(today: string): DailyLog[] {
  const logs: DailyLog[] = [];
  PATTERN.forEach((words, index) => {
    if (words === 0) return;
    const day = addDays(today, index - PATTERN.length);
    const main = Math.round(words * 0.7);
    logs.push({
      day,
      docs: {
        "sample-1": { title: TITLES[index % TITLES.length], words: main },
        "sample-2": { title: TITLES[(index + 1) % TITLES.length], words: words - main },
      },
    });
  });
  return logs;
}
