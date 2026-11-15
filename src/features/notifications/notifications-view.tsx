"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { useViewer } from "@/lib/viewer";
import { NOTIFICATION_TABS, inTab } from "./notification-model";
import { NotificationList } from "./notification-list";
import type { NotificationTab } from "./types";
import { useNotifications } from "./use-notifications";

/**
 * Notifikasi (PLT-04, DESIGN.md 6.6): tabs Semua, Komentar, Proyek; unread lines first marked by a
 * dot. The list is dummy data with a read state kept on this device, so it has no loading or error
 * state until it comes from the server.
 */
export function NotificationsView() {
  const guest = useViewer() === "tamu";
  const { items, unread, now, markRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState<NotificationTab>("semua");

  return (
    <div className="max-w-182">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <h1 className="heading-lg">Notifikasi</h1>
        {!guest && (
          <Button
            variant="text"
            size="sm"
            className="-my-2 text-ink"
            disabled={unread === 0}
            onClick={markAllRead}
          >
            Tandai semua dibaca
          </Button>
        )}
      </div>
      {!guest && (
        <p aria-live="polite" className="mt-1 text-sm text-ink-muted">
          {unread === 0 ? "Semua sudah dibaca." : `${unread} belum dibaca.`}
        </p>
      )}

      {guest ? (
        <EmptyState
          className="mt-4"
          action={
            <Button disabled title="Masuk tersedia setelah akun dibuka">
              Masuk
            </Button>
          }
        >
          Masuk untuk melihat notifikasimu.
        </EmptyState>
      ) : (
        <>
          <Tabs
            label="Jenis notifikasi"
            value={tab}
            className="mt-4"
            onValueChange={(id) => setTab(id as NotificationTab)}
            items={NOTIFICATION_TABS}
          />
          <NotificationList items={inTab(items, tab)} now={now} onOpen={markRead} />
        </>
      )}
    </div>
  );
}
