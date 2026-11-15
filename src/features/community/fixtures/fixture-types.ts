import type { Comment, PostCore } from "../types";

/** A dummy post. Times are "how long ago" so the fixtures never look stale. */
export type FixturePost = PostCore & {
  agoMs: number;
  /** How long ago the text was updated after publishing, when it was. */
  updatedAgoMs?: number;
};

export type FixtureComment = Omit<Comment, "createdAt"> & { agoMs: number };
