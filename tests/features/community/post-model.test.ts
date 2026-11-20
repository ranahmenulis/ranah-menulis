import { describe, expect, it } from "vitest";
import { canRead, feedFor, isFollowing } from "@/features/community/feed";
import { ME_ID } from "@/features/community/fixtures/authors";
import { groupSeeds } from "@/features/community/groups/group-store";
import {
  MAX_POST_WORDS,
  postLabel,
  relatedPosts,
  sharedDocumentIds,
  resolveFixturePosts,
  tileForm,
  wordsOf,
} from "@/features/community/post-model";
import { mark, type StoredPost } from "@/features/community/storage/post-store";

const posts = resolveFixturePosts(Date.now());
const byId = (id: string) => posts.find((p) => p.id === id)!;

describe("fixtures", () => {
  it("keep every post within the 500-word limit", () => {
    for (const p of posts) expect(wordsOf(p.blocks)).toBeLessThanOrEqual(MAX_POST_WORDS);
  });

  it("have unique ids", () => {
    expect(new Set(posts.map((p) => p.id)).size).toBe(posts.length);
  });
});

describe("tileForm and labels", () => {
  it("shows a short text as a note and the rest with a title", () => {
    expect(tileForm(byId("toples-kerupuk"))).toBe("note");
    expect(tileForm(byId("jam-dinding-kedai-kopi-ah-seng"))).toBe("titled");
  });

  it("places a photo by its shape: wide cover, above the title, or under a note", () => {
    expect(tileForm(byId("penjaga-mercusuar"))).toBe("cover");
    expect(tileForm(byId("surat-dari-lantai-dua-puluh"))).toBe("image");
    expect(tileForm(byId("kereta-malam-ke-bandung"))).toBe("inset");
  });

  it("keeps text tiles the majority (DESIGN.md 6.8)", () => {
    const withPhoto = posts.filter((p) => p.image).length;
    expect(withPhoto).toBeGreaterThan(0);
    expect(withPhoto / posts.length).toBeLessThan(0.5);
  });

  it("labels a post honestly as prolog or cuplikan with its genre", () => {
    expect(postLabel(byId("hujan-pertama-bulan-november"))).toBe("Prolog · Cerpen");
    expect(postLabel(byId("toples-kerupuk"))).toBe("Cuplikan · Puisi");
  });
});

describe("relatedPosts", () => {
  it("returns at most five, never the post itself, same genre first", () => {
    const post = byId("hujan-pertama-bulan-november");
    const related = relatedPosts(post, posts);
    expect(related.length).toBeLessThanOrEqual(5);
    expect(related.map((p) => p.id)).not.toContain(post.id);
    expect(related[0].genre).toBe(post.genre);
  });
});

describe("feedFor", () => {
  it("has followed authors, own posts, and group posts", () => {
    const ids = feedFor(posts, {}, groupSeeds, ME_ID).map((p) => p.id);
    expect(ids).toContain("toples-kerupuk"); // Hafiz is followed by default
    expect(ids).toContain("hujan-pertama-bulan-november"); // own post
    expect(ids).toContain("garam-dan-pelabuhan"); // group post
    expect(ids).not.toContain("probolinggo-pukul-lima"); // Maya is not followed
  });

  it("adds an author's posts after following and removes them after unfollowing", () => {
    const follow = { [mark.following("maya-anindita")]: true };
    expect(feedFor(posts, follow).map((p) => p.id)).toContain("probolinggo-pukul-lima");
    const unfollow = { [mark.following("hafiz-rahman")]: false };
    expect(isFollowing(unfollow, "hafiz-rahman")).toBe(false);
    expect(feedFor(posts, unfollow).map((p) => p.id)).not.toContain("toples-kerupuk");
  });

  it("keeps group posts away from signed-out readers", () => {
    expect(canRead(byId("garam-dan-pelabuhan"), groupSeeds, null)).toBe(false);
    expect(canRead(byId("garam-dan-pelabuhan"), groupSeeds, ME_ID)).toBe(true);
    expect(canRead(byId("toples-kerupuk"), groupSeeds, null)).toBe(true);
  });
});

describe("sharedDocumentIds", () => {
  const stored = (over: Partial<StoredPost>): StoredPost => ({
    id: "p",
    status: "published",
    title: "T",
    kind: "prolog",
    genre: "Cerpen",
    blocks: [],
    sourceTitle: null,
    sourceDocId: null,
    visibility: "publik",
    updatedAt: 1,
    ...over,
  });

  it("collects documents that have a published post, and ignores drafts and posts written directly", () => {
    const ids = sharedDocumentIds([
      stored({ id: "a", sourceDocId: "d1" }),
      stored({ id: "b", sourceDocId: "d2", status: "draft" }),
      stored({ id: "c", sourceDocId: null }),
      stored({ id: "d", sourceDocId: "d1" }),
    ]);
    expect([...ids]).toEqual(["d1"]);
  });
});
