import { formatClock } from "@/features/studio/count-words";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "12 Nov", with the year when it is not the current one. */
export function formatDay(timestamp: number, now: number): string {
  const date = new Date(timestamp);
  const label = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === new Date(now).getFullYear()
    ? label
    : `${label} ${date.getFullYear()}`;
}

/** Feed and comment time: "baru saja", "40 menit", "2 jam", "kemarin", "3 hari", then "12 Nov". */
export function formatAgo(timestamp: number, now: number): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) return "baru saja";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} menit`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} jam`;

  const days = Math.floor(diff / DAY);
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari`;
  return formatDay(timestamp, now);
}

/** Absolute time in the reader's zone for the post meta line: "13 Nov pukul 03.37". */
export function formatAbsolute(timestamp: number, now: number): string {
  return `${formatDay(timestamp, now)} pukul ${formatClock(new Date(timestamp))}`;
}
