"use client";

import { Button } from "@/components/ui/button";
import { settlePayment } from "../registration-store";

/**
 * Stands in for the QRIS webhook and the Organizer panel (6g), so a paid project can be tried
 * now. Development only: it never shows in production. It calls the function the webhook will,
 * which refuses a payment that already arrived or whose hold ran out.
 */
export function DevPaymentPanel({ slug }: { slug: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="grid justify-items-start gap-1 border-t border-line pt-4">
      <Button variant="text" onClick={() => settlePayment(slug, Date.now())}>
        Simulasikan pembayaran masuk
      </Button>
      <p className="text-xs text-ink-muted">Hanya ada di pengembangan, sampai QRIS dibuat.</p>
    </div>
  );
}
