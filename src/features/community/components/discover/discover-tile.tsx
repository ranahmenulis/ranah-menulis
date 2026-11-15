"use client";

import { BookmarkSimple, ChatCircle, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { authorOf, excerptOf, postLabel, tileForm } from "../../post-model";
import type { Post } from "../../types";

type Props = {
  post: Post;
  comments: number;
  saved: boolean;
  onSave: () => void;
};

/** "Rinjani Putri" or "Aina Sofea · Kuala Lumpur": who wrote it, small, above the text. */
export function AuthorLine({ authorId, size = 20 }: { authorId: string; size?: 20 | 32 }) {
  const author = authorOf(authorId);
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs">
      <Avatar name={author.name} size={size} />
      <span className="min-w-0 truncate">
        <b className="font-medium">{author.name}</b>
        {author.place && <span className="text-ink-muted"> · {author.place}</span>}
      </span>
    </div>
  );
}

/**
 * One tile of the Jelajahi grid (DESIGN.md 6.8): a box with one border and no box inside it, in
 * one of three shapes. Appreciations and comments are counts here, not buttons; the title is a
 * stretched link that makes the whole tile open the post. Below 576px of width it is a plain row.
 */
export function DiscoverTile({ post, comments, saved, onSave }: Props) {
  const form = tileForm(post);
  const label = postLabel(post);
  const href = `/postingan/${post.id}`;
  const linkClass = "text-ink no-underline after:absolute after:inset-0 hover:underline";

  return (
    <article
      className={cn(
        "relative mb-6 grid break-inside-avoid border border-line bg-canvas",
        "@max-xl:mb-0 @max-xl:border-0 @max-xl:border-b",
        form === "image" &&
          "@max-xl:grid-cols-[minmax(0,1fr)_5rem] @max-xl:items-start @max-xl:gap-x-4",
      )}
    >
      {form === "image" && (
        <div
          role="img"
          aria-label={`Foto unggahan penulis untuk ${post.title}`}
          className={cn(
            "grid aspect-3/2 place-items-center border-b border-line bg-subtle text-[13px] leading-[18px] text-ink-muted",
            "@max-xl:col-start-2 @max-xl:row-start-1 @max-xl:mt-5 @max-xl:h-13 @max-xl:w-20 @max-xl:border-0",
          )}
        >
          <span className="@max-xl:hidden">Foto unggahan penulis</span>
        </div>
      )}

      <div
        className={cn(
          "grid min-w-0 gap-2 p-5 @max-xl:px-0",
          form === "image" && "@max-xl:col-start-1 @max-xl:row-start-1",
        )}
      >
        <AuthorLine authorId={post.authorId} />

        {form === "note" ? (
          <>
            <p className="line-clamp-8 font-serif text-base leading-[26px] whitespace-pre-line text-ink-read">
              {post.blocks.map((b) => b.text).join("\n\n")}
            </p>
            <p className="text-[13px] leading-[18px] text-ink-muted">
              {label} dari “
              <Link href={href} className={linkClass}>
                {post.title}
              </Link>
              ”
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-[18px] text-ink-muted">{label}</p>
            <h2 className="feed-title text-[20px] leading-[26px] @max-xl:text-[18px] @max-xl:leading-6">
              <Link href={href} className={linkClass}>
                {post.title}
              </Link>
            </h2>
            <p className="line-clamp-3 feed-excerpt whitespace-pre-line @max-xl:line-clamp-2">
              {excerptOf(post)}
            </p>
          </>
        )}

        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span
            aria-label={`Apresiasi ${post.appreciations}`}
            className="flex items-center gap-1.5 tabular-nums"
          >
            <Heart size={16} aria-hidden />
            {post.appreciations}
          </span>
          <span
            aria-label={`Komentar ${comments}`}
            className="flex items-center gap-1.5 tabular-nums"
          >
            <ChatCircle size={16} aria-hidden />
            {comments}
          </span>
          <button
            type="button"
            aria-label={saved ? "Hapus dari Tersimpan" : "Simpan"}
            aria-pressed={saved}
            onClick={onSave}
            className="relative z-10 -my-2 -mr-2 ml-auto grid size-8 cursor-pointer place-items-center rounded-full hover:text-ink aria-pressed:text-ink"
          >
            <BookmarkSimple size={16} weight={saved ? "fill" : "regular"} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
