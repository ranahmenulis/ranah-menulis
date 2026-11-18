"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { canRead, isFollowing } from "../feed";
import { ME_ID } from "../fixtures/authors";
import { groupIdOf, postMembershipId } from "../groups/group-model";
import { writingGroups } from "../groups/group-store";
import { useGroupReader } from "../groups/group-viewer";
import { resolveFixtureComments, resolveFixturePosts } from "../post-model";
import { removedIds } from "../moderation/removed";
import { useModeration } from "../moderation/report-store";
import { mark, toPost, type Marks, type PostStore, type StoredPost } from "../storage/post-store";
import type { Comment, Post } from "../types";

export type CommunityData = {
  status: "loading" | "ready" | "error";
  /** When the data was read; relative times ("2 jam") are measured from here. */
  now: number;
  /** Published posts visible to this reader, with marks applied. */
  posts: Post[];
  drafts: StoredPost[];
  /** Comments that are not deleted, in time order. */
  comments: Comment[];
  marks: Marks;
  reload: () => void;
  following: (authorId: string) => boolean;
  /** Flips a mark (appreciate, save, follow, ...). Resolves false when storing it failed. */
  toggle: (key: string, current: boolean) => Promise<boolean>;
  addComment: (
    input: Pick<Comment, "postId" | "parentId" | "text" | "mention">,
  ) => Promise<boolean>;
};

function applyMarks(posts: Post[], marks: Marks): Post[] {
  return posts.map((p) => ({
    ...p,
    appreciations: p.appreciations + (marks[mark.appreciated(p.id)] ? 1 : 0),
    saves: p.saves + (marks[mark.saved(p.id)] ? 1 : 0),
  }));
}

/**
 * Everything Community screens read: fixtures plus what was written on this device, with the
 * reader's own marks applied. One load per screen; actions update state first and then store.
 */
export function useCommunity(
  store: PostStore,
  options: { includeRemoved?: boolean } = {},
): CommunityData {
  const includeRemoved = options.includeRemoved ?? false;
  const decisions = useModeration();
  const reader = useGroupReader();
  const groups = writingGroups.use();
  const [status, setStatus] = useState<CommunityData["status"]>("loading");
  const [now, setNow] = useState(0);
  const [stored, setStored] = useState<StoredPost[]>([]);
  const [storedComments, setStoredComments] = useState<Comment[]>([]);
  const [marks, setMarks] = useState<Marks>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([store.listPosts(), store.listComments(), store.listMarks()])
      .then(([postList, commentList, markMap]) => {
        if (cancelled) return;
        setStored(postList);
        setStoredComments(commentList);
        setMarks(markMap);
        setNow(Date.now());
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [store, attempt]);

  const removed = useMemo(() => removedIds(decisions), [decisions]);

  const posts = useMemo(() => {
    if (status !== "ready") return [];
    const mine = stored.flatMap((s) => toPost(s) ?? []);
    const all = applyMarks([...resolveFixturePosts(now), ...mine], marks);
    if (includeRemoved) return all;
    return all
      .filter((p) => !removed.posts.has(p.id) && canRead(p, groups, reader))
      .map((p) =>
        p.visibility === "grup"
          ? {
              ...p,
              groupId: groupIdOf(p),
              groupMembershipId: postMembershipId(p),
              groupName: groups.find((group) => group.id === groupIdOf(p))?.name,
            }
          : p,
      );
  }, [status, now, stored, marks, includeRemoved, removed, groups, reader]);

  const comments = useMemo(() => {
    if (status !== "ready") return [];
    const visiblePostIds = new Set(posts.map((p) => p.id));
    return [...resolveFixtureComments(now), ...storedComments]
      .filter((c) => !marks[mark.deleted(c.id)])
      .filter(
        (c) => includeRemoved || (visiblePostIds.has(c.postId) && !removed.comments.has(c.id)),
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [status, now, storedComments, marks, includeRemoved, removed, posts]);

  const toggle = useCallback(
    async (key: string, current: boolean) => {
      setMarks((m) => ({ ...m, [key]: !current }));
      try {
        await store.setMark(key, !current);
        return true;
      } catch {
        setMarks((m) => ({ ...m, [key]: current }));
        return false;
      }
    },
    [store],
  );

  const addComment = useCallback<CommunityData["addComment"]>(
    async (input) => {
      const comment: Comment = {
        ...input,
        id: crypto.randomUUID(),
        authorId: ME_ID,
        createdAt: Date.now(),
      };
      try {
        await store.putComment(comment);
        setStoredComments((list) => [...list, comment]);
        return true;
      } catch {
        return false;
      }
    },
    [store],
  );

  return {
    status,
    now,
    posts,
    drafts: stored.filter((s) => s.status === "draft").sort((a, b) => b.updatedAt - a.updatedAt),
    comments,
    marks,
    reload: () => {
      setStatus("loading");
      setAttempt((n) => n + 1);
    },
    following: (authorId) => isFollowing(marks, authorId),
    toggle,
    addComment,
  };
}
