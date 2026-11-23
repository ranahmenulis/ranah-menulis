"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { NoticeLantern } from "@/components/illustrations/letter-art";
import { PageHero } from "@/components/ui/page-hero";
import { Tabs } from "@/components/ui/tabs";
import { feedCardClass } from "@/features/home/feed-card";
import { cn } from "@/lib/cn";
import type { PostStore } from "@/features/community/storage/post-store";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/format";
import { useViewer } from "@/lib/viewer";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { NOTIFICATION_TABS, inTab } from "./notification-model";
import { NotificationList } from "./notification-list";
import type { NotificationTab } from "./types";
import { useNotifications } from "./use-notifications";

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
  const t = useT();
  const copy = t.notifications;
  const shell = t.shell;
  const locale = useLocale();
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
  const unreadText =
    unread > 0
      ? format(copy.unread, { count: formatNumber(unread, locale) })
      : loading
        ? copy.loading
        : failed
          ? copy.failedNone
          : copy.allRead;

  useLayoutEffect(() => {
    if (!focusedRow.current || visible.some((item) => item.id === focusedRow.current)) return;
    focusedRow.current = null;
    if (document.activeElement === document.body) (status.current ?? heading.current)?.focus();
  }, [visible]);

  return (
    <div className="mx-auto grid w-full max-w-320 min-w-0 gap-6">
      <PageHero
        titleId="notifications-title"
        titleRef={heading}
        title={copy.title}
        body={copy.intro}
        art={NoticeLantern}
        actions={
          guest ? undefined : (
            <Button variant="secondary" size="sm" disabled={unread === 0} onClick={markAllRead}>
              {copy.markAll}
            </Button>
          )
        }
      />

      {guest ? (
        <EmptyState action={<SignInButton>{shell.guest.signIn}</SignInButton>}>
          {copy.signInPrompt}
        </EmptyState>
      ) : (
        <div className={cn(feedCardClass, "grid")}>
          <div className="grid gap-1 px-5 pt-4 md:px-6">
            <p ref={status} role="status" tabIndex={-1} className="text-sm text-ink-muted">
              {unavailable ? copy.unavailable : null}
              {unreadText}
            </p>
            {roles.some((role) => role !== "organizer") && (
              <p className="text-sm text-ink-muted">{copy.staffNote}</p>
            )}
          </div>
          <Tabs
            label={copy.tabsLabel}
            value={tab}
            className="mt-2 px-5 md:px-6"
            onValueChange={(id) => setTab(id as NotificationTab)}
            items={NOTIFICATION_TABS.map((t) => ({ id: t.id, label: copy.tabs[t.id] }))}
          />
          <div className="pb-1">
            {failed && (
              <ErrorBanner className="mx-5 mt-4 md:mx-6" action={<RetryButton onClick={retry} />}>
                {copy.partialFailed}
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
                className="flex gap-3 border-b border-line px-5 py-4 opacity-0 motion-safe:animate-[rm-appear_0s_300ms_forwards] motion-reduce:opacity-100 md:px-6"
              >
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
