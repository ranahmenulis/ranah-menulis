"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, Notice } from "@/components/ui/states";
import { idrLabel, remainingLabel } from "@/features/projects/payment-model";
import { formatProjectDateTime } from "@/features/projects/project-model";
import type { Project, Registration } from "@/features/projects/types";
import { confirmPaymentFor } from "../organizer-actions";
import { paymentRow, paymentStateLabel, takesPayment } from "../payment-rows";

/**
 * Payments of the project (PLT-07): confirm that money arrived, until the QRIS webhook does it.
 * Only the registration made on this device is visible. The result is said in words beside the
 * list, because the button is gone once the payment is confirmed. Proof of transfer and rejecting
 * it are not built yet.
 */
export function PaymentsTab({
  project,
  registration,
  now,
}: {
  project: Project;
  registration: Registration | undefined;
  now: number;
}) {
  const [asking, setAsking] = useState(false);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const row = paymentRow(project, registration, now);

  function confirm() {
    const changed = confirmPaymentFor(project.slug, Date.now());
    setAsking(false);
    setSaid(
      changed
        ? "Pembayaran dikonfirmasi. Pendaftaran peserta sekarang aktif."
        : "Pembayaran ini sudah lunas atau waktu tahanannya habis, jadi tidak ada yang diubah.",
    );
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="pembayaran-title" className="grid max-w-170 gap-4">
      <h2 id="pembayaran-title" className="heading-md">
        Pembayaran
      </h2>
      {!takesPayment(project) ? (
        <Notice>Proyek ini gratis, jadi tidak ada pembayaran.</Notice>
      ) : (
        <p className="text-sm text-ink-muted">
          Hanya pendaftaran di perangkat ini yang terbaca. Konfirmasi otomatis lewat QRIS menyusul.
        </p>
      )}
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {takesPayment(project) &&
        (!row ? (
          <EmptyState>Belum ada pendaftar di perangkat ini.</EmptyState>
        ) : (
          <ul className="border-t border-line">
            <li className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3">
              <div className="grid min-w-0 gap-0.5">
                <span className="font-medium">{paymentStateLabel[row.state]}</span>
                <span className="text-sm text-ink-muted">
                  {row.amount === null
                    ? "Harga ringgit, belum bisa lewat QRIS"
                    : idrLabel(row.amount)}
                  {row.packageName ? ` · Paket ${row.packageName}` : ""} · mendaftar{" "}
                  {formatProjectDateTime(row.registeredAt, project.timeZone)}
                </span>
                <span className="text-xs text-ink-muted">
                  {row.state === "menunggu" && `Kursi ditahan, ${remainingLabel(row.dueAt, now)}.`}
                  {row.state === "kedaluwarsa" && "Kursinya sudah dibuka lagi."}
                  {row.state === "lunas" &&
                    row.paidAt !== undefined &&
                    `Dikonfirmasi ${formatProjectDateTime(row.paidAt, project.timeZone)}${row.paidBy === "organizer" ? " oleh pengelola" : ""}.`}
                </span>
              </div>
              {row.state === "menunggu" && (
                <Button variant="secondary" onClick={() => setAsking(true)}>
                  Konfirmasi pembayaran
                </Button>
              )}
            </li>
          </ul>
        ))}
      {asking && (
        <Dialog
          open
          onClose={() => setAsking(false)}
          title="Konfirmasi pembayaran ini?"
          description="Pastikan uangnya sudah masuk. Pendaftaran peserta menjadi aktif dan peserta diberi tahu."
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(false)}>
                Batal
              </Button>
              <Button onClick={confirm}>Konfirmasi pembayaran</Button>
            </>
          }
        />
      )}
    </section>
  );
}
