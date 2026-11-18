"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { PostStore } from "@/features/community/storage/post-store";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useViewer } from "@/lib/viewer";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { NOTIFICATION_TABS, inTab } from "./notification-model";
import { NotificationList } from "./notification-list";
import type { NotificationTab } from "./types";
import { useNotifications } from "./use-notifications";

const number = new Intl.NumberFormat("id-ID");

function unreadLabel(unread: number, loading: boolean, failed: boolean) {
  if (unread > 0) return `${number.format(unread)} belum dibaca.`;
  if (loading) return "Memuat notifikasi…";
  if (failed) return "Tidak ada notifikasi belum dibaca yang bisa ditampilkan.";
  return "Semua sudah dibaca.";
}

export function NotificationsView({
  store,
  tasks,
  solo,
  posts,
}: {
  store?: SubmissionStore;
  tasks?: AssignmentStore;
  solo?: SoloStore;
  posts?: PostStore;
}) {
  const guest = useViewer() === "tamu";
  const roles = useEffectiveRoles();
  const {
    items,
    unread,
    now,
    markRead,
    markAllRead,
    loading,
    failed,
    retry,
    confirmOpen,
    refreshTarget,
  } = useNotifications(store, tasks, solo, posts);
  const [tab, setTab] = useState<NotificationTab>("semua");
  const [unavailable, setUnavailable] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusedRow = useRef<string | null>(null);
  const visible = inTab(items, tab);

  useLayoutEffect(() => {
    if (!focusedRow.current || visible.some((item) => item.id === focusedRow.current)) return;
    focusedRow.current = null;
    if (document.activeElement === document.body) (status.current ?? heading.current)?.focus();
  }, [visible]);

  return (
    <div className="max-w-182">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <h1 ref={heading} tabIndex={-1} className="heading-lg">
          Notifikasi
        </h1>
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
        <p ref={status} role="status" tabIndex={-1} className="mt-1 text-sm text-ink-muted">
          {unavailable ? "Notifikasi ini sudah tidak tersedia. " : null}
          {unreadLabel(unread, loading, failed)}
        </p>
      )}

      {guest ? (
        <EmptyState className="mt-4" action={<SignInButton>Masuk</SignInButton>}>
          Masuk untuk melihat notifikasimu.
        </EmptyState>
      ) : (
        <>
          {roles.some((role) => role !== "organizer") && (
            <p className="mt-1 text-sm text-ink-muted">
              Notifikasi pengelola tampil selama masih perlu ditangani [usulan].
            </p>
          )}
          <Tabs
            label="Jenis notifikasi"
            value={tab}
            className="mt-4"
            onValueChange={(id) => setTab(id as NotificationTab)}
            items={NOTIFICATION_TABS}
          />
          {failed && (
            <ErrorBanner className="mt-3" action={<RetryButton onClick={retry} />}>
              Sebagian notifikasi belum bisa dimuat.
            </ErrorBanner>
          )}
          {(visible.length > 0 || (!loading && !failed)) && (
            <NotificationList
              items={visible}
              now={now}
              confirmOpen={confirmOpen}
              onFocusCapture={(event) => {
                focusedRow.current =
                  (event.target as HTMLElement).closest<HTMLElement>("[data-notification-id]")
                    ?.dataset.notificationId ?? null;
              }}
              onOpen={(id) => {
                setUnavailable(false);
                markRead(id);
              }}
              onUnavailable={(item) => {
                setUnavailable(true);
                status.current?.focus();
                refreshTarget(item);
              }}
            />
          )}
          {loading && (
            <div
              aria-hidden
              className="flex gap-3 border-b border-line py-4 opacity-0 motion-safe:animate-[rm-appear_0s_300ms_forwards] motion-reduce:opacity-100"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
