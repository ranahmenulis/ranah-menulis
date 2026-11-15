import { formatClock } from "./count-words";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** "Diubah" meta: "baru saja", "40 menit lalu", "2 jam lalu", "hari ini 08.40", "10 Nov". */
export function formatChanged(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const date = new Date(timestamp);
  const today = new Date(now);
  const sameDay = date.toDateString() === today.toDateString();

  if (diff < MINUTE) return "baru saja";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} menit lalu`;
  if (diff < 6 * HOUR && sameDay) return `${Math.floor(diff / HOUR)} jam lalu`;
  if (sameDay) return `hari ini ${formatClock(date)}`;
  const label = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === today.getFullYear() ? label : `${label} ${date.getFullYear()}`;
}
