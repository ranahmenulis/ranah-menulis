import type { Notification } from "@/features/notifications/types";
import { formatProjectDateTime, projectHref } from "./project-model";
import { payHref, paymentDueAt, paymentState } from "./payment-model";
import type { Project, RegistrationMap } from "./types";

/**
 * Notifications about payment (PRD 20, PLT-07), derived from the registrations on this device: one
 * while the payment waits, one when it arrived, one when the hold ran out. Each has a stable id per
 * registration and step, so it is read once. The waiting one gives way to the others, as in a real
 * inbox where the newest state wins. A free project, or a paid one confirmed before payments were
 * recorded (no `paidAt`), has no payment events.
 */
export function paymentNotifications(
  projects: Project[],
  registrations: RegistrationMap,
  now: number,
): Notification[] {
  const out: Notification[] = [];
  for (const project of projects) {
    const registration = registrations[project.slug];
    if (!registration) continue;
    const base = { kind: "project", actorId: null, others: 0, agoMs: 0 } as const;
    const state = paymentState(registration, now);
    if (state === "lunas") {
      if (registration.paidAt === undefined) continue;
      out.push({
        ...base,
        id: `bayar-${project.slug}-${registration.registeredAt}-lunas`,
        text: `Pembayaran ${project.title} diterima. Kamu sudah terdaftar.`,
        href: projectHref(project.slug),
        at: registration.paidAt,
      });
    } else if (state === "kedaluwarsa") {
      out.push({
        ...base,
        id: `bayar-${project.slug}-${registration.registeredAt}-habis`,
        text: `Waktu pembayaran ${project.title} habis. Pendaftarannya berakhir dan kuotanya dibuka lagi.`,
        href: projectHref(project.slug),
        at: paymentDueAt(registration),
      });
    } else {
      out.push({
        ...base,
        id: `bayar-${project.slug}-${registration.registeredAt}-menunggu`,
        text: `Pembayaran ${project.title} menunggu. Kuotamu ditahan sampai ${formatProjectDateTime(paymentDueAt(registration), project.timeZone)}.`,
        href: payHref(project.slug),
        at: registration.registeredAt,
      });
    }
  }
  return out;
}
