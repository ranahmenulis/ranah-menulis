"use client";

import { BookmarkSimple, ChatCircle, DotsThree, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { formatAgo } from "@/features/community/format-time";
import { authorOf, excerptOf, postLabel, tileForm } from "@/features/community/post-model";
import type { Post } from "@/features/community/types";

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

type Props = {
  post: Post;
  now: number;
  comments: number;
  appreciated: boolean;
  saved: boolean;
  onAppreciate: () => void;
  onSave: () => void;
};

/**
 * Feed entry without a card, separated by a line (DESIGN.md 6.2). A work shows title and excerpt
 * with an honest label ("Prolog · Esai"); a short text is shown straight away with its title under
 * it. Every entry opens the post page.
 */
export function FeedItem({ post, now, comments, appreciated, saved, onAppreciate, onSave }: Props) {
  const author = authorOf(post.authorId);
  const isNote = tileForm(post) === "note";
  const href = `/postingan/${post.id}`;
  const link = "text-ink no-underline after:absolute after:inset-0 hover:underline";

  return (
    <article className="relative grid gap-2.5 border-b border-line py-6">
      <div className="flex items-center gap-2 text-xs">
        <Avatar name={author.name} size={isNote ? 32 : 20} />
        <span className="min-w-0">
          {post.visibility === "grup" && post.groupName && (
            <>
              di <b className="font-medium">{post.groupName}</b> oleh{" "}
            </>
          )}
          <b className="font-medium">{author.name}</b>
          <span className="text-ink-muted"> · {formatAgo(post.publishedAt, now)}</span>
        </span>
      </div>

      {isNote ? (
        <>
          <p className="line-clamp-[8] font-serif text-base leading-[26px] whitespace-pre-line text-ink-read">
            {post.blocks.map((b) => b.text).join("\n\n")}
          </p>
          <p className="text-xs text-ink-muted">
            {postLabel(post)} dari “
            <Link href={href} className={link}>
              {post.title}
            </Link>
            ”
          </p>
        </>
      ) : (
        <>
          <h3 className="feed-title">
            <Link href={href} className={link}>
              {post.title}
            </Link>
          </h3>
          <p className="line-clamp-2 feed-excerpt whitespace-pre-line">{excerptOf(post)}</p>
          <p className="text-xs text-ink-muted">{postLabel(post)}</p>
        </>
      )}

      <div className={cn("relative z-10 flex items-center gap-4", !isNote && "-mt-1")}>
        <Action
          icon={Heart}
          label="Apresiasi"
          count={post.appreciations}
          pressed={appreciated}
          onClick={onAppreciate}
        />
        <Action icon={ChatCircle} label="Komentar" count={comments} />
        <span className="flex-1" />
        <Action icon={BookmarkSimple} label="Simpan" pressed={saved} onClick={onSave} />
        <Action icon={DotsThree} label="Menu lainnya" />
      </div>
    </article>
  );
}
