import { DEFAULT_FOLLOWING, ME_ID } from "./fixtures/authors";
import { canReadGroupPost, type WritingGroup } from "./groups/group-model";
import { mark, type Marks } from "./storage/post-store";
import type { Post } from "./types";

export function isFollowing(marks: Marks, authorId: string): boolean {
  return marks[mark.following(authorId)] ?? DEFAULT_FOLLOWING.includes(authorId);
}

/** Group posts are readable only by members of that group. */
export function canRead(post: Post, groups: readonly WritingGroup[], readerId: string | null) {
  return post.visibility === "publik" || canReadGroupPost(post, groups, readerId);
}

/**
 * Beranda "Mengikuti": public posts of authors you follow, posts in your groups, and your own
 * posts, newest first (PRD 16). Nothing is ranked by appreciations.
 */
export function feedFor(
  posts: Post[],
  marks: Marks,
  groups: readonly WritingGroup[] = [],
  readerId: string | null = null,
): Post[] {
  return posts
    .filter((p) =>
      p.visibility === "grup"
        ? canRead(p, groups, readerId)
        : p.authorId === ME_ID || isFollowing(marks, p.authorId),
    )
    .sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id));
}
