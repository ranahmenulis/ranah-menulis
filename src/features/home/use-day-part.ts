import { useAccount } from "@/features/account/account-store";
import { dayPart, type DayPart } from "@/components/illustrations/home-art";
import { writingTime } from "@/features/studio/writing-time";

/**
 * The part of the day at `nowMs` in the writer's time zone. `nowMs` is 0 until the page has read
 * the clock in an effect (never during render), and then there is no part yet.
 */
export function partOf(nowMs: number, timeZone: string): DayPart | null {
  if (!nowMs) return null;
  return dayPart(writingTime(nowMs, timeZone).hour);
}

export function useDayPart(nowMs: number): DayPart | null {
  return partOf(nowMs, useAccount().profile.timeZone);
}
