import { countWords } from "@/lib/text-stats";
import { authors } from "./fixtures/authors";
import { fixtureComments } from "./fixtures/comments";
import { postsA } from "./fixtures/posts-a";
import { postsB } from "./fixtures/posts-b";
import type { StoredPost } from "./storage/post-store";
import type { Author, Comment, Post, PostBlock, PostCore } from "./types";

/** COM-01: a post is a prolog or an excerpt of at most 500 words. */
export const MAX_POST_WORDS = 500;

/** A note is a short text shown before its title (DESIGN.md 6.8). [usulan] threshold. */
const NOTE_MAX_WORDS = 45;

export const blocksText = (blocks: PostBlock[]) => blocks.map((b) => b.text).join(" ");

export const wordsOf = (blocks: PostBlock[]) => countWords(blocksText(blocks));

/** "Prolog · Cerpen": the honest label shown wherever a post is listed (COM-01). */
export type PostLabels = {
  prolog: string;
  cuplikan: string;
  genres: Record<PostCore["genre"], string>;
};

const ID_LABELS: PostLabels = {
  prolog: "Prolog",
  cuplikan: "Cuplikan",
  genres: { Cerpen: "Cerpen", Puisi: "Puisi", Esai: "Esai", Memoar: "Memoar", Novel: "Novel" },
};

export function postLabel(
  post: Pick<PostCore, "kind" | "genre">,
  labels: PostLabels = ID_LABELS,
): string {
  return `${labels[post.kind]} · ${labels.genres[post.genre]}`;
}

export type TileForm = "note" | "titled" | "cover" | "image" | "inset";

/** A photo at least this much wider than tall can lead a wide tile. [usulan] */
const COVER_RATIO = 1.25;

/** A short text is a note; anything longer is shown under its title (DESIGN.md 6.8). */
export const isNote = (post: Post) => wordsOf(post.blocks) <= NOTE_MAX_WORDS;

/**
 * Which tile shape a post takes in Jelajahi (DESIGN.md 6.8). Without a photo: note or titled. With
 * one: a note keeps its text first and the photo below it ("inset"); a titled post with a
 * landscape photo becomes a wide tile led by the photo ("cover"), otherwise the photo sits above
 * the title in a normal tile ("image").
 */
export function tileForm(post: Post): TileForm {
  const note = isNote(post);
  if (!post.image) return note ? "note" : "titled";
  if (note) return "inset";
  return post.image.width / post.image.height >= COVER_RATIO ? "cover" : "image";
}

/** First block that is running text; used as the excerpt under a title. */
export function excerptOf(post: Post): string {
  return (post.blocks.find((b) => b.type !== "heading") ?? post.blocks[0])?.text ?? "";
}

const authorIndex = new Map(authors.map((a) => [a.id, a]));

export function authorOf(id: string): Author {
  return authorIndex.get(id) ?? { id, name: "Penulis", handle: id, country: "ID" };
}

export const authorByHandle = (handle: string) => authors.find((a) => a.handle === handle);

/** Fixture posts with "how long ago" turned into timestamps at the moment of `now`. */
export function resolveFixturePosts(now: number): Post[] {
  return [...postsA, ...postsB].map(({ agoMs, updatedAgoMs, ...core }) => ({
    ...core,
    publishedAt: now - agoMs,
    updatedAt: updatedAgoMs === undefined ? undefined : now - updatedAgoMs,
  }));
}

export function resolveFixtureComments(now: number): Comment[] {
  return fixtureComments.map(({ agoMs, ...rest }) => ({ ...rest, createdAt: now - agoMs }));
}

/** How many comments each post has, from a flat list of comments. */
export function commentCounts(comments: readonly Comment[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of comments) counts.set(c.postId, (counts.get(c.postId) ?? 0) + 1);
  return counts;
}

/** Related reading: same genre first, then the most appreciated; never the post itself. [konfirmasi] */
export function relatedPosts(post: Post, publicPosts: Post[], limit = 5): Post[] {
  return publicPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => {
      const sameGenre = Number(b.genre === post.genre) - Number(a.genre === post.genre);
      return sameGenre || b.appreciations - a.appreciations || a.id.localeCompare(b.id);
    })
    .slice(0, limit);
}

/**
 * Studio documents that have a published post copied from them (the "Dibagikan" tag, DESIGN.md 6.4).
 * Drafts do not count: nothing public exists yet.
 */
export function sharedDocumentIds(posts: readonly StoredPost[]): Set<string> {
  const ids = new Set<string>();
  for (const p of posts) if (p.status === "published" && p.sourceDocId) ids.add(p.sourceDocId);
  return ids;
}
