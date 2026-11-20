"use client";

import { AuthorAvatar } from "@/features/community/components/author-avatar";
import { BookmarkSimple, ChatCircle, DotsThree, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatAgo } from "@/features/community/format-time";
import { authorOf, excerptOf, isNote, postLabel } from "@/features/community/post-model";
import type { Post } from "@/features/community/types";
import { AuthorLink } from "@/features/profile/author-link";

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
      className="flex h-9 cursor-pointer items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink aria-pressed:text-ink md:text-xs"
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
 * Feed entry without a card, separated by a line (DESIGN.md 6.2). A photo, when the author attached
 * one, sits on the right at 3:2. A work shows title and excerpt
 * with an honest label ("Prolog · Esai"); a short text is shown straight away with its title under
 * it. Every entry opens the post page.
 */
export function FeedItem({ post, now, comments, appreciated, saved, onAppreciate, onSave }: Props) {
  const author = authorOf(post.authorId);
  const note = isNote(post);
  const href = `/postingan/${post.id}`;
  const link = "text-ink no-underline after:absolute after:inset-0 hover:underline";

  return (
    <article className="relative grid gap-2.5 border-b border-line py-7 md:py-6">
      <div className="flex items-center gap-2 text-[13px] leading-[18px] md:text-xs md:leading-4">
        <AuthorAvatar author={author} size={note ? 32 : 20} />
        <span className="min-w-0">
          {post.visibility === "grup" && post.groupName && (
            <>
              di <b className="font-medium">{post.groupName}</b> oleh{" "}
            </>
          )}
          <AuthorLink handle={author.handle} className="font-medium">
            {author.name}
          </AuthorLink>
          <span className="text-ink-muted"> · {formatAgo(post.publishedAt, now)}</span>
        </span>
      </div>

      <div
        className={cn(
          "grid gap-2.5",
          post.image &&
            "grid-cols-[minmax(0,1fr)_5rem] items-start gap-x-4 md:grid-cols-[minmax(0,1fr)_10rem] md:gap-x-6",
        )}
      >
        <div className="grid min-w-0 gap-2.5">
          {note ? (
            <>
              <p className="line-clamp-[8] font-serif text-base leading-[26px] whitespace-pre-line text-ink-read">
                {post.blocks.map((b) => b.text).join("\n\n")}
              </p>
              <p className="text-[13px] leading-[18px] text-ink-muted md:text-xs md:leading-4">
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
              <p className="text-[13px] leading-[18px] text-ink-muted md:text-xs md:leading-4">
                {postLabel(post)}
              </p>
            </>
          )}
        </div>
        {post.image && (
          // Already resized WebP in /public; see the Jelajahi tile.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image.src}
            alt={post.image.alt}
            width={160}
            height={107}
            loading="lazy"
            decoding="async"
            className="aspect-3/2 w-full bg-subtle object-cover"
          />
        )}
      </div>

      <div className={cn("relative z-10 flex items-center gap-4", !note && "-mt-1")}>
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
