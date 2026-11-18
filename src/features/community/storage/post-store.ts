import { ME_ID } from "../fixtures/authors";
import type { Comment, Genre, Post, PostBlock, PostKind, Visibility } from "../types";

/** What a post written on this device looks like in storage. Drafts may be incomplete. */
export type StoredPost = {
  id: string;
  status: "draft" | "published";
  title: string;
  kind: PostKind;
  /** Null while a draft has no genre yet. */
  genre: Genre | null;
  blocks: PostBlock[];
  /** Title of the Studio document the text was copied from; null when written directly. */
  sourceTitle: string | null;
  /** The document it was copied from, to tell the author when it has since been trashed. */
  sourceDocId: string | null;
  /** Null until the author chooses; a post is never public by default (BR-COM-01). */
  visibility: Visibility | null;
  groupName?: string;
  groupId?: string;
  groupMembershipId?: string;
  updatedAt: number;
  publishedAt?: number;
};

/**
 * Marks are the reader's own toggles, keyed by kind and id: "ap:<post>" appreciated, "sv:<post>"
 * saved, "fo:<author>" following, "ch:<comment>" hidden by the post's author, "cr:<comment>"
 * reported, "cd:<comment>" deleted.
 */
export type Marks = Record<string, boolean>;

/**
 * Where Community data written on this device lives. Today: IndexedDB. The Supabase store replaces
 * it after the design is approved; screens only see this interface.
 */
export interface PostStore {
  listPosts(): Promise<StoredPost[]>;
  getPost(id: string): Promise<StoredPost | null>;
  putPost(post: StoredPost): Promise<void>;
  deletePost(id: string): Promise<void>;
  listComments(): Promise<Comment[]>;
  putComment(comment: Comment): Promise<void>;
  listMarks(): Promise<Marks>;
  setMark(key: string, value: boolean): Promise<void>;
}

export const mark = {
  appreciated: (postId: string) => `ap:${postId}`,
  saved: (postId: string) => `sv:${postId}`,
  following: (authorId: string) => `fo:${authorId}`,
  hidden: (commentId: string) => `ch:${commentId}`,
  reported: (commentId: string) => `cr:${commentId}`,
  deleted: (commentId: string) => `cd:${commentId}`,
};

/** A published stored post as the screens use it. Drafts have no public form, so they give null. */
export function toPost(stored: StoredPost): Post | null {
  if (stored.status !== "published" || !stored.genre || !stored.visibility) return null;
  return {
    id: stored.id,
    authorId: ME_ID,
    title: stored.title,
    kind: stored.kind,
    genre: stored.genre,
    blocks: stored.blocks,
    sourceTitle: stored.sourceTitle,
    visibility: stored.visibility,
    groupName: stored.groupName,
    groupId: stored.groupId,
    groupMembershipId: stored.groupMembershipId,
    appreciations: 0,
    saves: 0,
    publishedAt: stored.publishedAt ?? stored.updatedAt,
    local: true,
  };
}
