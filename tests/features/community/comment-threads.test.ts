import { describe, expect, it } from "vitest";
import { buildThreads, countComments } from "@/features/community/comment-threads";
import type { Comment } from "@/features/community/types";

const c = (id: string, parentId: string | null, createdAt: number, postId = "p"): Comment => ({
  id,
  postId,
  authorId: "a",
  parentId,
  text: id,
  createdAt,
});

describe("buildThreads", () => {
  it("puts the newest top-level comment first and replies oldest first", () => {
    const threads = buildThreads(
      [c("old", null, 1), c("new", null, 5), c("r2", "old", 4), c("r1", "old", 2)],
      "p",
    );
    expect(threads.map((t) => t.root.id)).toEqual(["new", "old"]);
    expect(threads[1].replies.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("ignores comments of other posts and drops replies whose parent is gone", () => {
    const threads = buildThreads(
      [c("a", null, 1), c("x", null, 2, "other"), c("orphan", "gone", 3)],
      "p",
    );
    expect(threads).toHaveLength(1);
    expect(countComments(threads)).toBe(1);
  });
});
