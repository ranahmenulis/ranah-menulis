import { describe, expect, it } from "vitest";
import { CATEGORIES, PAGE_SIZE, postsForCategory, visibleCategories } from "./categories";
import { authorOf, resolveFixturePosts } from "./post-model";
import type { Post } from "./types";

const NOW = Date.now();
const fixtures = resolveFixturePosts(NOW);
const mine: Post = {
  ...fixtures[0],
  id: "baru",
  authorId: "rinjani-putri",
  local: true,
  publishedAt: NOW,
};

describe("postsForCategory", () => {
  it("never lists a group post in Jelajahi", () => {
    const groupPost = fixtures.find((p) => p.visibility === "grup")!;
    for (const c of CATEGORIES) {
      expect(postsForCategory(c.id, fixtures).map((p) => p.id)).not.toContain(groupPost.id);
    }
  });

  it("orders Most Appreciated by appreciations, and Semua by time", () => {
    const counts = postsForCategory("appreciated", fixtures).map((p) => p.appreciations);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    const times = postsForCategory("semua", fixtures).map((p) => p.publishedAt);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("takes Indonesia and Malaysia Writers from the author's country", () => {
    for (const p of postsForCategory("my", fixtures)) {
      expect(authorOf(p.authorId).country).toBe("MY");
    }
    for (const p of postsForCategory("id", fixtures)) {
      expect(authorOf(p.authorId).country).toBe("ID");
    }
  });

  it("puts a post written here first in Semua, Trending Today, and its country", () => {
    const all = [...fixtures, mine];
    expect(postsForCategory("semua", all)[0].id).toBe("baru");
    expect(postsForCategory("trending", all)[0].id).toBe("baru");
    expect(postsForCategory("id", all)[0].id).toBe("baru");
    expect(postsForCategory("my", all).map((p) => p.id)).not.toContain("baru");
  });
});

describe("visibleCategories", () => {
  it("lists every category when each has posts", () => {
    expect(visibleCategories(fixtures).map((c) => c.id)).toEqual(CATEGORIES.map((c) => c.id));
  });

  it("hides categories that have nothing in them (COM-09)", () => {
    const onlyIndonesian = fixtures.filter((p) => authorOf(p.authorId).country === "ID");
    const ids = visibleCategories(onlyIndonesian).map((c) => c.id);
    expect(ids).not.toContain("my");
    expect(ids).toContain("id");
  });

  it("shows nothing at all when there are no posts", () => {
    expect(visibleCategories([])).toEqual([]);
  });
});

describe("paging", () => {
  it("needs more than one page for Semua, so Muat lebih banyak has something to load", () => {
    expect(postsForCategory("semua", fixtures).length).toBeGreaterThan(PAGE_SIZE);
  });
});
