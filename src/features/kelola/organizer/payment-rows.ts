import {
  paymentDueAt,
  paymentState,
  payableIdr,
  type PaymentState,
} from "@/features/projects/payment-model";
import { isFree } from "@/features/projects/project-model";
import { registrationFee } from "@/features/projects/registration-model";
import type { Project, Registration } from "@/features/projects/types";

/** Whether registering for this project costs money, so it has payments to look at (PLT-07). */
export const takesPayment = (project: Project): boolean => !isFree(project);

export type PaymentRow = {
  state: PaymentState;
  registeredAt: number;
  dueAt: number;
  packageName?: string;
  /** Rupiah to pay; `null` when the price is only in ringgit (QRIS is IDR only). */
  amount: number | null;
  paidAt?: number;
  paidBy?: Registration["paidBy"];
};

/**
 * The payment of the registration made on this device, or `null` when there is none. An expired
 * hold is still a row: the Organizer should see it ran out, not find it gone.
 */
export function paymentRow(
  project: Project,
  registration: Registration | undefined,
  now: number,
): PaymentRow | null {
  if (!registration || !takesPayment(project)) return null;
  return {
    state: paymentState(registration, now),
    registeredAt: registration.registeredAt,
    dueAt: paymentDueAt(registration),
    packageName: registration.packageName,
    amount: payableIdr(registrationFee(project, registration.packageName)),
    paidAt: registration.paidAt,
    paidBy: registration.paidBy,
  };
}

export const paymentStateLabel: Record<PaymentState, string> = {
  menunggu: "Menunggu pembayaran",
  lunas: "Lunas",
  kedaluwarsa: "Waktu pembayaran habis",
};
