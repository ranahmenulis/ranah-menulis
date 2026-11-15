import { parseDay, type StreakRun } from "./streak";

const number = new Intl.NumberFormat("id-ID");
const range = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

export function formatRun(run: StreakRun): string {
  const start = parseDay(run.start);
  const end = parseDay(run.end);
  if (run.start === run.end) return range.format(start);
  // Same month reads "8–12 Nov"; different months keep both: "28 Okt–2 Nov".
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${start.getDate()}–${range.format(end)}`
    : `${range.format(start)}–${range.format(end)}`;
}

type TodayInput = { target: number; todayWords: number; current: number; broken: boolean };

/** One honest sentence about today. No exclamation marks, no "failed" (DESIGN.md 12, canvas notes). */
export function todayLine({ target, todayWords, current, broken }: TodayInput): string {
  if (todayWords >= target)
    return `Target hari ini tercapai. Streakmu naik menjadi ${current} hari.`;
  const left = number.format(target - todayWords);
  return broken && current === 0
    ? `${left} kata lagi untuk memulai streak baru hari ini.`
    : `${left} kata lagi sebelum hari berganti pukul 00.00.`;
}

/** Second line of the streak block: whether today is counted yet, or what a broken streak was. */
export function streakLine({
  reachedToday,
  current,
  last,
}: {
  reachedToday: boolean;
  current: number;
  last: StreakRun | null;
}): string {
  if (current === 0 && last) {
    return `Streak sebelumnya ${last.length} hari, ${formatRun(last)}. Kalender tetap menyimpan setiap hari yang sudah kamu tulis.`;
  }
  return reachedToday
    ? "Hari ini sudah dihitung."
    : "Hari ini belum dihitung sampai target tercapai.";
}

/** Intl returns weekdays in lowercase for Indonesian; sentences start with a capital. */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toLocaleUpperCase("id") + text.slice(1);
}
