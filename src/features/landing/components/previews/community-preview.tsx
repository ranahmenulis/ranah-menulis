"use client";

import { BookmarkSimple, ChatCircle, Heart } from "@phosphor-icons/react/dist/ssr";
import { useT } from "@/lib/i18n/provider";
import { Tag } from "./preview-frame";

/**
 * Community as it is built (a followed writer's excerpt, Appreciation, comments), with the
 * programs the client asked for shown as coming later. Mirrors FeedItem in features/home.
 */
export function CommunityPreview() {
  const { ecosystem } = useT().landing;
  const c = ecosystem.community;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3.5 md:px-6">
        {c.programs.map((p) => (
          <span
            key={p}
            className="inline-flex h-8 items-center rounded-full border border-dashed border-line-strong px-3 text-xs font-medium text-ink-muted"
          >
            {p}
          </span>
        ))}
        <Tag>{ecosystem.soon}</Tag>
      </div>
      <div className="grid gap-3 px-4 py-5 md:px-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="grid size-6 place-items-center rounded-full bg-subtle text-[10px] font-semibold">
            {c.initials}
          </span>
          <b className="font-medium">{c.author}</b>
          <span className="text-ink-muted">· {c.time}</span>
        </div>
        <p className="font-serif text-base leading-[26px] text-ink-read">{c.excerpt}</p>
        <span className="text-xs text-ink-muted">{c.meta}</span>
        <div className="flex items-center gap-5 text-xs text-ink-muted tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Heart size={16} aria-hidden /> 31
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ChatCircle size={16} aria-hidden /> 4
          </span>
          <BookmarkSimple size={16} aria-hidden className="ml-auto" />
        </div>
      </div>
    </>
  );
}
