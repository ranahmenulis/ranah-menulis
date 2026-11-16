export type Country = "ID" | "MY";
export const COUNTRIES: readonly Country[] = ["ID", "MY"];

/** The fallback until the device is asked (server render, tests without Intl support). */
export const DEFAULT_TIME_ZONE = "Asia/Jakarta";

/** Zones of the two launch countries (PLT-02). Labels are translated on screen. */
export const TIME_ZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Kuala_Lumpur",
] as const;

/** The device's own zone. PLT-02: the profile starts with it and the reader may change it. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/** The country a zone most likely belongs to; Indonesia unless the zone is Malaysian. */
export function countryForZone(zone: string): Country {
  return zone === "Asia/Kuala_Lumpur" || zone === "Asia/Kuching" ? "MY" : "ID";
}

/** A zone name Intl understands; anything else (old storage, a typo) is rejected. */
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** The curated zones, plus the device's zone when it is somewhere else (a reader abroad). */
export function zoneOptions(current: string, device: string): string[] {
  const zones: string[] = [...TIME_ZONES];
  for (const extra of [current, device]) if (extra && !zones.includes(extra)) zones.push(extra);
  return zones;
}
