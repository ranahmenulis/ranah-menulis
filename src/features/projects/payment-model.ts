import { moneyLabel, projectHref } from "./project-model";
import type { Money, Registration, RegistrationMap } from "./types";

/**
 * [usulan, Q-20] How long a registration that waits for payment keeps its seat. The client has not
 * decided the length; it is a sample and lives in one place so it can change.
 */
export const HOLD_MS = 24 * 60 * 60 * 1000;

export const payHref = (slug: string) => `${projectHref(slug)}/bayar`;

/** The hold runs from the registration; nothing extra is stored, so older registrations work too. */
export const paymentDueAt = (registration: Registration): number =>
  registration.registeredAt + HOLD_MS;

export type PaymentState = "lunas" | "menunggu" | "kedaluwarsa";

export function paymentState(registration: Registration, now: number): PaymentState {
  if (registration.status === "terdaftar") return "lunas";
  return now >= paymentDueAt(registration) ? "kedaluwarsa" : "menunggu";
}

/** Whether this registration takes one seat of the quota: paid ones and unexpired holds. */
export const holdsSeat = (registration: Registration, now: number): boolean =>
  paymentState(registration, now) !== "kedaluwarsa";

/** A registration whose hold ran out may be replaced by registering again. */
export const isExpired = (registration: Registration, now: number): boolean =>
  paymentState(registration, now) === "kedaluwarsa";

/**
 * Payment arrives: what the QRIS webhook, and later an Organizer, will call. `null` = refused,
 * because it is already paid or the hold ran out (the seat may be gone).
 */
export function confirmPayment(registration: Registration, now: number): Registration | null {
  if (paymentState(registration, now) !== "menunggu") return null;
  return { ...registration, status: "terdaftar", paidAt: now };
}

/** Amount to pay in rupiah (QRIS is IDR only, PRD 19); `null` when the price is only in ringgit. */
export function payableIdr(fee: Money): number | null {
  const { idr } = fee;
  return idr !== undefined && idr > 0 ? idr : null;
}

export const idrLabel = (amount: number): string => moneyLabel({ idr: amount });

/** "sisa 5 jam 12 menit" until the hold ends; minutes are rounded up so it never shows 0 early. */
export function remainingLabel(dueAt: number, now: number): string {
  const minutes = Math.max(1, Math.ceil((dueAt - now) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `sisa ${rest} menit`;
  return rest === 0 ? `sisa ${hours} jam` : `sisa ${hours} jam ${rest} menit`;
}

/** The registration unless its payment hold ran out: an expired one no longer counts anywhere. */
export function liveRegistration(
  registration: Registration | undefined,
  now: number,
): Registration | undefined {
  return registration && !isExpired(registration, now) ? registration : undefined;
}

export function liveRegistrations(map: RegistrationMap, now: number): RegistrationMap {
  return Object.fromEntries(Object.entries(map).filter(([, r]) => !isExpired(r, now)));
}
