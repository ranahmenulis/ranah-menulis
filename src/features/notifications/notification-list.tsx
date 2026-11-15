"use client";

import { Books } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { authorOf } from "@/features/community/post-model";
import type { NotificationView } from "./notification-model";
import { agoLabel, leadOf } from "./notification-text";

/**
 * One line (DESIGN.md 6.6): ink dot while unread, avatar or project icon at 32, a sentence with the
 * actor in 500, and the time. Opening it marks it read; a line without a destination yet is a
 * button that only marks it read.
 */
function NotificationRow({
  item,
  now,
  onOpen,
}: {
  item: NotificationView;
  now: number;
  onOpen: (id: string) => void;
}) {
  const lead = leadOf(item);
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
          <Books size={18} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm [overflow-wrap:anywhere]",
            unread ? "text-ink" : "text-ink-muted",
          )}
        >
          {unread && <span className="sr-only">Belum dibaca. </span>}
          {lead && <b className="font-medium">{lead}</b>} {item.text}
        </span>
        <span className="mt-0.5 block min-h-4 text-xs text-ink-muted">
          {now > 0 && agoLabel(item.agoMs, now)}
        </span>
      </span>
    </>
  );

  return (
    <li className="border-b border-line">
      {item.href ? (
        <Link href={item.href} className={row} onClick={() => onOpen(item.id)}>
          {content}
        </Link>
      ) : (
        <button type="button" className={row} onClick={() => onOpen(item.id)}>
          {content}
        </button>
      )}
    </li>
  );
}

export function NotificationList({
  items,
  now,
  onOpen,
}: {
  items: NotificationView[];
  now: number;
  onOpen: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        action={
          <ButtonLink href="/beranda" variant="secondary">
            Ke Beranda
          </ButtonLink>
        }
      >
        Belum ada notifikasi di sini.
      </EmptyState>
    );
  }
  return (
    <ul>
      {items.map((item) => (
        <NotificationRow key={item.id} item={item} now={now} onOpen={onOpen} />
      ))}
    </ul>
  );
}
