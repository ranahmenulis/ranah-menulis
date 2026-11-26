"use client";

import { useEffect, useState } from "react";
import { cardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/provider";
import { idrLabel } from "../payment-model";
import { settlePayment } from "../registration-store";

type LiveQris = {
  uniqueAmount: number;
  qrisString: string;
  qrisImageBase64?: string;
};

/**
 * Displays the live PaymentGT QRIS charge when configured on the server, polling every 5s so
 * payment settles even on localhost without a public webhook. Falls back to the sample card when
 * PaymentGT environment variables are not set.
 */
export function QrisChargeCard({ slug, amount }: { slug: string; amount: number }) {
  const t = useT().projectsFlow.payment.waiting;
  const locale = useLocale();
  const [live, setLive] = useState<LiveQris | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function init() {
      try {
        const res = await fetch("/api/payments/qris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, amountIdr: amount }),
        });
        if (!res.ok || !active) return;
        const json = (await res.json()) as {
          enabled?: boolean;
          status?: string;
          uniqueAmount?: number;
          qrisString?: string;
          qrisImageBase64?: string;
        };
        if (!json.enabled || !active) return;
        if (json.status === "paid") {
          settlePayment(slug, Date.now(), "sistem");
          return;
        }
        if (json.status === "pending" && json.qrisString) {
          setLive({
            uniqueAmount: json.uniqueAmount ?? amount,
            qrisString: json.qrisString,
            qrisImageBase64: json.qrisImageBase64,
          });
          timer = setInterval(async () => {
            try {
              const poll = await fetch(`/api/payments/qris?slug=${encodeURIComponent(slug)}`, {
                cache: "no-store",
              });
              if (!poll.ok || !active) return;
              const p = (await poll.json()) as { status?: string };
              if (p.status === "paid" && active) {
                if (timer) clearInterval(timer);
                settlePayment(slug, Date.now(), "sistem");
              }
            } catch {}
          }, 5000);
        }
      } catch {}
    }

    void init();
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [slug, amount]);

  const shownAmount = live?.uniqueAmount ?? amount;

  return (
    <figure className={cn(cardClass, "grid justify-items-center gap-3")}>
      {live?.qrisImageBase64 ? (
        // Dynamic base64 QRIS image returned by PaymentGT.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            live.qrisImageBase64.startsWith("data:")
              ? live.qrisImageBase64
              : `data:image/png;base64,${live.qrisImageBase64}`
          }
          alt={t.qrisAlt}
          className="size-48 rounded-xl border border-line bg-white object-contain p-2"
        />
      ) : (
        <div
          role="img"
          aria-label={t.qrisAlt}
          className="grid size-48 place-items-center rounded-xl border-2 border-dashed border-accent/40 bg-accent-subtle/50 p-4 text-center text-sm text-ink-muted"
        >
          {live ? "QRIS aktif" : t.qrisSample}
        </div>
      )}
      <figcaption className="text-center text-sm text-ink-muted">
        {t.amount} <span className="font-semibold text-ink">{idrLabel(shownAmount, locale)}</span>
      </figcaption>
    </figure>
  );
}
