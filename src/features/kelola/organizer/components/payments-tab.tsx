"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { EmptyState, Notice } from "@/components/ui/states";
import { idrLabel, remainingLabel } from "@/features/projects/payment-model";
import { formatProjectDateTime } from "@/features/projects/project-model";
import type { Project, Registration } from "@/features/projects/types";
import { confirmPaymentFor } from "../organizer-actions";
import { paymentRow, takesPayment } from "../payment-rows";
import { listCardClass } from "../../components/list-card";

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
  const tabs = useT().kelolaOrganizerTabs;
  const t = tabs.payments;
  const locale = useLocale();
  const [asking, setAsking] = useState(false);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const row = paymentRow(project, registration, now);

  function confirm() {
    const changed = confirmPaymentFor(project.slug, Date.now());
    setAsking(false);
    setSaid(changed ? t.confirmed : t.unchanged);
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="pembayaran-title" className="grid max-w-170 gap-4">
      <h2 id="pembayaran-title" className="heading-md">
        {t.title}
      </h2>
      {!takesPayment(project) ? (
        <Notice>{t.free}</Notice>
      ) : (
        <p className="text-sm text-ink-muted">{t.note}</p>
      )}
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {takesPayment(project) &&
        (!row ? (
          <EmptyState>{t.none}</EmptyState>
        ) : (
          <ul className={listCardClass}>
            <li className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3">
              <div className="grid min-w-0 gap-0.5">
                <span className="font-medium">{t.state[row.state]}</span>
                <span className="text-sm text-ink-muted">
                  {row.amount === null ? t.ringgit : idrLabel(row.amount, locale)}
                  {row.packageName ? format(t.packageSuffix, { name: row.packageName }) : ""}
                  {format(t.registeredAt, {
                    date: formatProjectDateTime(row.registeredAt, project.timeZone, locale),
                  })}
                </span>
                <span className="text-xs text-ink-muted">
                  {row.state === "menunggu" &&
                    format(t.holding, { remaining: remainingLabel(row.dueAt, now, locale) })}
                  {row.state === "kedaluwarsa" && t.expired}
                  {row.state === "lunas" &&
                    row.paidAt !== undefined &&
                    format(t.paidAt, {
                      date: formatProjectDateTime(row.paidAt, project.timeZone, locale),
                      by: row.paidBy === "organizer" ? t.byOrganizer : "",
                    })}
                </span>
              </div>
              {row.state === "menunggu" && (
                <Button variant="secondary" onClick={() => setAsking(true)}>
                  {t.confirm}
                </Button>
              )}
            </li>
          </ul>
        ))}
      {asking && (
        <Dialog
          open
          onClose={() => setAsking(false)}
          title={t.dialogTitle}
          description={t.dialogBody}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(false)}>
                {tabs.common.cancel}
              </Button>
              <Button onClick={confirm}>{t.confirm}</Button>
            </>
          }
        />
      )}
    </section>
  );
}
