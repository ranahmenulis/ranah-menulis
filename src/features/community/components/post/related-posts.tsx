"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { BookOpenText } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { usePostLabel } from "../../hooks/use-post-label";
import { excerptOf } from "../../post-model";
import type { Post } from "../../types";
import { AuthorLine } from "../discover/discover-tile";

/** "Tulisan terkait": at most five, in the row pattern of the feed (DESIGN.md 6.9 #5). */
export function RelatedPosts({
  posts,
  title,
  icon = BookOpenText,
}: {
  posts: Post[];
  title?: string;
  icon?: PhosphorIcon;
}) {
  const postLabel = usePostLabel();
  const fallback = useT().post.related.title;
  const heading = title ?? fallback;
  if (posts.length === 0) return null;
  return (
    <section aria-label={heading} className={cn(cardClass, "mt-6")}>
      <h2 className="mb-1 flex items-center gap-2.5 heading-md">
        <SectionIcon icon={icon} />
        {heading}
      </h2>
      {posts.map((post) => (
        <article
          key={post.id}
          className="relative grid gap-1.5 border-b border-line py-5 last:border-b-0 last:pb-0"
        >
          <AuthorLine authorId={post.authorId} />
          <p className="text-[13px] leading-[18px] text-ink-muted">{postLabel(post)}</p>
          <h3 className="feed-title text-[20px] leading-[26px]">
            <Link
              href={`/postingan/${post.id}`}
              className="text-ink no-underline after:absolute after:inset-0 hover:underline"
            >
              {post.title}
            </Link>
          </h3>
          <p className="line-clamp-2 feed-excerpt whitespace-pre-line">{excerptOf(post)}</p>
        </article>
      ))}
    </section>
  );
}
