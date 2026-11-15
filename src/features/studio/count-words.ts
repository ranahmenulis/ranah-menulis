/** Word count shown in the editor bar and used as the basis for the daily target (STD-04). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

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
