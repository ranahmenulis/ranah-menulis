import Link from "next/link";
import { excerptOf, postLabel } from "../../post-model";
import type { Post } from "../../types";
import { AuthorLine } from "../discover/discover-tile";

/** "Tulisan terkait": at most five, in the row pattern of the feed (DESIGN.md 6.9 #5). */
export function RelatedPosts({
  posts,
  title = "Tulisan terkait",
}: {
  posts: Post[];
  title?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section aria-label={title} className="mt-14">
      <h2 className="mb-2 text-xl leading-7 font-semibold">{title}</h2>
      {posts.map((post) => (
        <article key={post.id} className="relative grid gap-1.5 border-b border-line py-5">
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
