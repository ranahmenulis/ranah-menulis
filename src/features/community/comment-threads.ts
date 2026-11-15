import type { Comment } from "./types";

export type Thread = { root: Comment; replies: Comment[] };

/**
 * Comments as a flat list of threads, one level deep (DESIGN.md 6.9 #3): top-level comments newest
 * first, each with its replies oldest first. A reply whose top-level comment is gone is dropped.
 */
export function buildThreads(comments: Comment[], postId: string): Thread[] {
  const own = comments.filter((c) => c.postId === postId);
  const roots = own.filter((c) => c.parentId === null).sort((a, b) => b.createdAt - a.createdAt);
  return roots.map((root) => ({
    root,
    replies: own.filter((c) => c.parentId === root.id).sort((a, b) => a.createdAt - b.createdAt),
  }));
}

/** Everything that was said under the post, replies included. */
export const countComments = (threads: Thread[]) =>
  threads.reduce((sum, t) => sum + 1 + t.replies.length, 0);
