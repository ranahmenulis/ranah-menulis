"use client";

import { BookmarkSimple, ChatCircle, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { AuthorLink } from "@/features/profile/author-link";
import { revealDelay, useRevealOnce } from "../../hooks/use-reveal-once";
import { useRowSpan } from "../../hooks/use-row-span";
import { authorOf, excerptOf, postLabel, tileForm, type TileForm } from "../../post-model";
import type { Post, PostImage } from "../../types";

type Props = {
  post: Post;
  /** Position in the list; only sets how long the tile waits behind its neighbours. */
  index: number;
  comments: number;
  saved: boolean;
  onSave: () => void;
};

/** "Rinjani Putri" or "Aina Sofea · Kuala Lumpur": who wrote it, small, above the text. */
export function AuthorLine({ authorId, size = 20 }: { authorId: string; size?: 20 | 32 }) {
  const author = authorOf(authorId);
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs @max-xl:text-[13px]">
      <Avatar name={author.name} size={size} />
      <span className="min-w-0 truncate">
        <AuthorLink handle={author.handle} className="font-medium">
          {author.name}
        </AuthorLink>
        {author.place && <span className="text-ink-muted"> · {author.place}</span>}
      </span>
    </div>
  );
}

/**
 * The photo, at its own aspect ratio in lanes; a small 3:2 thumbnail on the right in the narrow
 * list. "inset" keeps it inside the tile's padding under the text, the others run edge to edge.
 */
function Photo({ image, form }: { image: PostImage; form: TileForm }) {
  return (
    // Plain <img>: the photos are already resized WebP in /public (same reason as landing Plate).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      className={cn(
        "block h-auto w-full bg-line object-cover",
        form === "inset" && "@xl:mx-5 @xl:mb-1 @xl:max-h-88 @xl:w-[calc(100%-2.5rem)]",
        "@max-xl:col-start-2 @max-xl:row-start-1 @max-xl:mt-7 @max-xl:aspect-3/2 @max-xl:w-20",
      )}
    />
  );
}

function Text({ post, form, href }: { post: Post; form: TileForm; href: string }) {
  const label = postLabel(post);
  const linkClass = "text-ink no-underline after:absolute after:inset-0 hover:underline";
  if (form === "note" || form === "inset") {
    return (
      <>
        <p
          className={cn(
            "font-serif text-base leading-[26px] whitespace-pre-line text-ink-read",
            form === "inset" ? "line-clamp-5" : "line-clamp-8",
          )}
        >
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
    );
  }
  return (
    <>
      <p className="text-[13px] leading-[18px] text-ink-muted">{label}</p>
      <h2
        className={cn(
          "feed-title @max-xl:text-[18px] @max-xl:leading-6",
          form === "cover"
            ? "text-[20px] leading-[26px] @4xl:text-[26px] @4xl:leading-[34px]"
            : "text-[20px] leading-[26px]",
        )}
      >
        <Link href={href} className={linkClass}>
          {post.title}
        </Link>
      </h2>
      <p className="line-clamp-3 feed-excerpt whitespace-pre-line @max-xl:line-clamp-2">
        {excerptOf(post)}
      </p>
    </>
  );
}

/**
 * One tile of the Jelajahi grid (DESIGN.md 6.8, Substack Explore). A quiet `subtle` surface with
 * no border and square corners, in one of five shapes (`tileForm`): note, titled, a wide tile led
 * by its photo ("cover", two lanes), a photo above the title ("image"), or a note with its photo
 * under the text ("inset"). The title is a stretched link that opens the post; counts are not
 * buttons. Below 576px of width the tile is a plain row with a small photo on the right.
 */
export function DiscoverTile({ post, index, comments, saved, onSave }: Props) {
  const form = tileForm(post);
  const href = `/postingan/${post.id}`;
  const ref = useRowSpan<HTMLElement>();
  const seen = useRevealOnce(ref);
  const photoFirst = post.image && (form === "cover" || form === "image");

  return (
    <article
      ref={ref}
      style={{ transitionDelay: seen ? `${revealDelay(index)}ms` : undefined }}
      className={cn(
        "relative grid self-start overflow-hidden",
        "@xl:[grid-row-end:span_var(--span,40)] @xl:bg-subtle",
        form === "cover" && "@4xl:col-span-2",
        // Reveal: a tile rises 12px and fades in once, the first time it is on screen (also new tiles
        // from "Muat lebih banyak" or a category change). Only transform and opacity; none under
        // reduced motion.
        "transition-[opacity,translate] duration-500 ease-(--ease-out)",
        !seen && "translate-y-3 opacity-0",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        "@max-xl:border-b @max-xl:border-line",
        post.image && "@max-xl:grid-cols-[minmax(0,1fr)_5rem] @max-xl:items-start @max-xl:gap-x-4",
      )}
    >
      {photoFirst && post.image && <Photo image={post.image} form={form} />}

      <div className="grid min-w-0 gap-2 px-5 pt-5 pb-3 @max-xl:col-start-1 @max-xl:row-start-1 @max-xl:px-0 @max-xl:pt-7">
        <AuthorLine authorId={post.authorId} />
        <Text post={post} form={form} href={href} />
      </div>

      {form === "inset" && post.image && <Photo image={post.image} form={form} />}

      <div className="flex items-center gap-4 px-5 pt-1 pb-4 text-xs text-ink-muted @max-xl:col-span-full @max-xl:px-0 @max-xl:pb-6 @max-xl:text-[13px]">
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
    </article>
  );
}
