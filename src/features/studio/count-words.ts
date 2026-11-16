/** 24-hour clock with a dot, as in the save indicator: "14.02". */
export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(date)
    .replace(":", ".");
}
