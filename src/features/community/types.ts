/** Shared Community types (COM-01, COM-04..06). Dummy data and local storage only for now. */

export type PostKind = "prolog" | "cuplikan";
export const GENRES = ["Cerpen", "Puisi", "Esai", "Memoar", "Novel"] as const;
export type Genre = (typeof GENRES)[number];
export type Visibility = "publik" | "grup";
export type Country = "ID" | "MY";

/**
 * One block of public text. Only the text itself is public, never the document it came from.
 * A line break inside a block is a "\n" (poems), rendered as a real line break.
 */
export type PostBlock = { type: "paragraph" | "quote" | "heading"; text: string };

export type Author = {
  id: string;
  name: string;
  handle: string;
  country: Country;
  /** City shown next to the name, e.g. "Kuala Lumpur". */
  place?: string;
};

export type PostImage = { src: string; width: number; height: number; alt: string };

export type PostCore = {
  id: string;
  authorId: string;
  title: string;
  kind: PostKind;
  genre: Genre;
  blocks: PostBlock[];
  /** Title of the work this was taken from; null when written directly in Community. */
  sourceTitle: string | null;
  visibility: Visibility;
  groupName?: string;
  groupId?: string;
  groupMembershipId?: string;
  appreciations: number;
  saves: number;
  /** Fixture posts only: a photo the author attached, at its own aspect ratio. */
  image?: PostImage;
};

/** A post as the screens use it: every time is an absolute timestamp. */
export type Post = PostCore & {
  publishedAt: number;
  /** Set when the author updated the text after publishing (Q-16). */
  updatedAt?: number;
  /** Written on this device (not a fixture): it comes first in the lists it belongs to. */
  local?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  /** Top-level comment this one answers; null for a top-level comment. Replies never nest deeper. */
  parentId: string | null;
  text: string;
  createdAt: number;
  /** Author handle this reply is aimed at when answering another reply. */
  mention?: string;
};

export type CategoryId =
  "semua" | "trending" | "new" | "editor" | "appreciated" | "saved" | "hidden" | "id" | "my";

export type ReportReason = "spam" | "hate" | "copyright" | "other";
