"use client";

import { BookmarkSimple, ChatCircle, DotsThree, Heart } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import type { FeedEntry } from "./fixtures";

function Action({
  icon: Icon,
  label,
  count,
  pressed,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  count?: number;
  pressed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="flex h-9 cursor-pointer items-center gap-1.5 text-xs text-ink-muted hover:text-ink aria-pressed:text-ink"
    >
      <Icon size={20} weight={pressed ? "fill" : "regular"} aria-hidden />
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </button>
  );
}

/**
 * Feed entry without a card, separated by a line (DESIGN.md 6.2). A work shows title and excerpt
 * with an honest label ("Prolog · Esai · 2 menit baca"); a note shows its text straight away.
 * Appreciation and save are local toggles until Community has a backend.
 */
export function FeedItem({ entry }: { entry: FeedEntry }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const isNote = entry.kind === "note";

  return (
    <article className="grid gap-2.5 border-b border-line py-6">
      <div className="flex items-center gap-2 text-xs">
        <Avatar name={entry.author} size={isNote ? 32 : 20} />
        <span className="min-w-0">
          {entry.kind === "work" && entry.group && (
            <>
              di <b className="font-medium">{entry.group}</b> oleh{" "}
            </>
          )}
          <b className="font-medium">{entry.author}</b>
          <span className="text-ink-muted"> · {entry.date}</span>
        </span>
      </div>

      {entry.kind === "work" ? (
        <>
          <h3 className="feed-title">{entry.title}</h3>
          <p className="line-clamp-2 feed-excerpt">{entry.excerpt}</p>
          <p className="text-xs text-ink-muted">{entry.label}</p>
        </>
      ) : (
        <p className="line-clamp-[8] font-serif text-base leading-[26px]">{entry.text}</p>
      )}

      <div className={cn("flex items-center gap-4", !isNote && "-mt-1")}>
        <Action
          icon={Heart}
          label="Apresiasi"
          count={entry.appreciations + (liked ? 1 : 0)}
          pressed={liked}
          onClick={() => setLiked((v) => !v)}
        />
        <Action icon={ChatCircle} label="Komentar" count={entry.comments} />
        <span className="flex-1" />
        <Action
          icon={BookmarkSimple}
          label="Simpan"
          pressed={saved}
          onClick={() => setSaved((v) => !v)}
        />
        <Action icon={DotsThree} label="Menu lainnya" />
      </div>
    </article>
  );
}
