"use client";

import { Bell, Books } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useRef,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/provider";
import { authorOf } from "@/features/community/post-model";
import { mayActivateNotification } from "./notification-access";
import type { NotificationView } from "./notification-model";
import { dayGroups } from "./notification-days";
import { agoLabel, leadOf, textOf } from "./notification-text";

type LinkActions = {
  confirmOpen?: (item: NotificationView) => Promise<boolean>;
  onUnavailable?: (item: NotificationView) => void;
};

function checkLink(
  event: MouseEvent<HTMLAnchorElement>,
  item: NotificationView,
  onUnavailable: LinkActions["onUnavailable"],
) {
  if (mayActivateNotification(item)) return true;
  event.preventDefault();
  onUnavailable?.(item);
  return false;
}

function VerifiedLink({
  item,
  href,
  intent,
  confirmOpen,
  onUnavailable,
  onOpen,
  className,
  children,
}: {
  item: NotificationView;
  href: string;
  intent: RefObject<number>;
  confirmOpen: NonNullable<LinkActions["confirmOpen"]>;
  onUnavailable: LinkActions["onUnavailable"];
  onOpen: (id: string) => void;
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!checkLink(event, item, onUnavailable)) return;
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      onOpen(item.id);
      return;
    }

    event.preventDefault();
    const activation = intent.current;
    const link = event.currentTarget;
    void confirmOpen(item)
      .catch(() => false)
      .then((allowed) => {
        if (activation !== intent.current) return;
        if (!link.isConnected || !link.getClientRects().length) return;
        if (!allowed || !mayActivateNotification(item)) return onUnavailable?.(item);
        onOpen(item.id);
        router.push(href);
      });
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      onClick={open}
      onAuxClick={(event) => checkLink(event, item, onUnavailable)}
    >
      {children}
    </Link>
  );
}

/**
 * One line (DESIGN.md 6.6): ink dot while unread, avatar or project icon at 32, a sentence with the
 * actor in 500, and the time. Opening it marks it read; a line without a destination yet is a
 * button that only marks it read.
 */
function NotificationRow({
  item,
  intent,
  now,
  onOpen,
  confirmOpen,
  onUnavailable,
}: {
  item: NotificationView;
  intent: RefObject<number>;
  now: number;
  onOpen: (id: string) => void;
} & LinkActions) {
  const copy = useT().notifications;
  const locale = useLocale();
  const lead = leadOf(item, copy);
  const unread = !item.read;
  const row = cn(
    "-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 px-2 py-4 text-left no-underline",
    "cursor-pointer hover:bg-subtle active:bg-line",
  );

  const content = (
    <>
      <span
        aria-hidden
        className={cn("mt-4 size-1.5 shrink-0 rounded-full", unread ? "bg-ink" : "bg-transparent")}
      />
      {item.actorId ? (
        <Avatar name={authorOf(item.actorId).name} size={32} />
      ) : (
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full bg-subtle text-ink"
        >
          {item.kind === "project" ? <Books size={18} /> : <Bell size={18} />}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm [overflow-wrap:anywhere]",
            unread ? "text-ink" : "text-ink-muted",
          )}
        >
          {unread && <span className="sr-only">{copy.unreadMark}</span>}
          {lead && <b className="font-medium">{lead}</b>} {textOf(item, copy.messages)}
        </span>
        <span className="mt-0.5 block min-h-4 text-xs text-ink-muted">
          {now > 0 && agoLabel(item, now, locale)}
        </span>
      </span>
    </>
  );

  if (!item.href) {
    return (
      <button
        type="button"
        className={row}
        onClick={() => {
          if (mayActivateNotification(item)) onOpen(item.id);
        }}
      >
        {content}
      </button>
    );
  }
  if (confirmOpen && item.target && item.target.kind !== "report") {
    return (
      <VerifiedLink
        item={item}
        href={item.href}
        intent={intent}
        className={row}
        confirmOpen={confirmOpen}
        onOpen={onOpen}
        onUnavailable={onUnavailable}
      >
        {content}
      </VerifiedLink>
    );
  }
  return (
    <Link
      href={item.href}
      prefetch={item.target ? false : undefined}
      className={row}
      onClick={(event) => {
        if (checkLink(event, item, onUnavailable)) onOpen(item.id);
      }}
      onAuxClick={(event) => checkLink(event, item, onUnavailable)}
    >
      {content}
    </Link>
  );
}

export function NotificationList({
  items,
  now,
  onOpen,
  onFocusCapture,
  ...actions
}: {
  items: NotificationView[];
  now: number;
  onOpen: (id: string) => void;
  onFocusCapture?: ComponentProps<"ul">["onFocusCapture"];
} & LinkActions) {
  const intent = useRef(0);
  const copy = useT().notifications;
  if (items.length === 0) {
    return (
      <EmptyState
        art="lighthouse"
        action={
          <ButtonLink href="/beranda" variant="secondary">
            {copy.toHome}
          </ButtonLink>
        }
      >
        {copy.empty}
      </EmptyState>
    );
  }
  // One flat list with the day headings as separators, so a row that moves to another day while
  // the other sources load keeps its element (a clicked link must stay connected).
  return (
    <ul
      onFocusCapture={onFocusCapture}
      onClickCapture={() => {
        intent.current += 1;
      }}
      onAuxClickCapture={() => {
        intent.current += 1;
      }}
    >
      {dayGroups(items, now, copy.days).flatMap((group, g) => [
        <li key={`day-${group.key}`} role="presentation" className="pt-6 first:pt-2">
          <h2
            className="rm-rise-in border-b border-line-strong pb-2 font-serif text-xl leading-7"
            style={{ "--i": g - 3 } as CSSProperties}
          >
            {group.label}
            <span className="ml-2 font-sans text-xs text-ink-muted tabular-nums">
              {group.items.length}
            </span>
          </h2>
        </li>,
        ...group.items.map((item, i) => (
          <li
            key={item.id}
            data-notification-id={item.id}
            className="rm-row-in border-b border-line"
            style={{ "--i": Math.min(i, 12) } as CSSProperties}
          >
            <NotificationRow item={item} intent={intent} now={now} onOpen={onOpen} {...actions} />
          </li>
        )),
      ])}
    </ul>
  );
}
