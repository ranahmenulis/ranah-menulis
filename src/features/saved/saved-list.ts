import { canRead } from "@/features/community/feed";
import { mark, type Marks } from "@/features/community/storage/post-store";
import type { Post } from "@/features/community/types";

const PREFIX = mark.saved("");

/** Ids of every post the reader currently has saved. */
export function savedPostIds(marks: Marks): string[] {
  return Object.entries(marks)
    .filter(([key, on]) => on && key.startsWith(PREFIX))
    .map(([key]) => key.slice(PREFIX.length));
}

/**
 * Splits saved ids into posts the reader can open (newest first) and ids that no longer lead
 * anywhere, such as a withdrawn post (PRD COM-06). The mark records no time, so "newest" is by
 * publication date.
 */
export function splitSaved(
  ids: readonly string[],
  posts: readonly Post[],
): { available: Post[]; unavailable: string[] } {
  const byId = new Map(posts.map((p) => [p.id, p]));
  const available: Post[] = [];
  const unavailable: string[] = [];
  for (const id of ids) {
    const post = byId.get(id);
    if (post && canRead(post, true)) available.push(post);
    else unavailable.push(id);
  }
  available.sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id));
  return { available, unavailable };
}
