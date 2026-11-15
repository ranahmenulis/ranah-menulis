import { DEFAULT_FOLLOWING, MY_GROUPS, ME_ID } from "./fixtures/authors";
import { mark, type Marks } from "./storage/post-store";
import type { Post } from "./types";

export function isFollowing(marks: Marks, authorId: string): boolean {
  return marks[mark.following(authorId)] ?? DEFAULT_FOLLOWING.includes(authorId);
}

/** Group posts are readable only by members of that group. */
export function canRead(post: Post, signedIn: boolean): boolean {
  if (post.visibility === "publik") return true;
  return signedIn && post.groupName !== undefined && MY_GROUPS.includes(post.groupName);
}

/**
 * Beranda "Mengikuti": public posts of authors you follow, posts in your groups, and your own
 * posts, newest first (PRD 16). Nothing is ranked by appreciations.
 */
export function feedFor(posts: Post[], marks: Marks): Post[] {
  return posts
    .filter(
      (p) =>
        p.authorId === ME_ID ||
        (p.visibility === "grup" && canRead(p, true)) ||
        (p.visibility === "publik" && isFollowing(marks, p.authorId)),
    )
    .sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id));
}
