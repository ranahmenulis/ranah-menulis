"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isFollowing } from "../feed";
import { ME_ID } from "../fixtures/authors";
import { resolveFixtureComments, resolveFixturePosts } from "../post-model";
import { mark, toPost, type Marks, type PostStore, type StoredPost } from "../storage/post-store";
import type { Comment, Post } from "../types";

export type CommunityData = {
  status: "loading" | "ready" | "error";
  /** When the data was read; relative times ("2 jam") are measured from here. */
  now: number;
  /** Every published post you may know about, marks applied. Callers filter by visibility. */
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
export function useCommunity(store: PostStore): CommunityData {
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

  const posts = useMemo(() => {
    if (status !== "ready") return [];
    const mine = stored.flatMap((s) => toPost(s) ?? []);
    return applyMarks([...resolveFixturePosts(now), ...mine], marks);
  }, [status, now, stored, marks]);

  const comments = useMemo(() => {
    if (status !== "ready") return [];
    return [...resolveFixtureComments(now), ...storedComments]
      .filter((c) => !marks[mark.deleted(c.id)])
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [status, now, storedComments, marks]);

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
