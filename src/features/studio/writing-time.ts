const formatters = new Map<string, Intl.DateTimeFormat>();

/** Calendar day and hour in the account zone at one point in time. */
export function writingTime(now: Date | number, timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return { day: `${read("year")}-${read("month")}-${read("day")}`, hour: Number(read("hour")) };
}
