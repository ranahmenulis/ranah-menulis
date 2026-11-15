import { describe, expect, it } from "vitest";
import { ME_ID, authors } from "@/features/community/fixtures/authors";
import { resolveFixturePosts } from "@/features/community/post-model";
import { mark } from "@/features/community/storage/post-store";
import { profiles } from "@/features/profile/fixtures";
import { OWN_PROFILE_HREF, profileHref } from "@/features/profile/profile-href";
import {
  followerCount,
  followingCount,
  genresOf,
  profileOf,
  publicWorks,
  whereOf,
} from "@/features/profile/profile-model";

const posts = resolveFixturePosts(Date.now());
const author = (id: string) => authors.find((a) => a.id === id)!;

describe("profile fixtures", () => {
  it("cover every author, so no profile opens empty", () => {
    for (const a of authors) expect(profiles[a.id]?.bio.length).toBeGreaterThan(0);
  });

  it("keep the own-profile link equal to the dummy reader's handle", () => {
    expect(OWN_PROFILE_HREF).toBe(profileHref(author(ME_ID).handle));
  });
});

describe("publicWorks", () => {
  it("lists only Publik posts of that author, newest first", () => {
    const works = publicWorks(posts, "hafiz-rahman");
    expect(works.length).toBeGreaterThan(0);
    expect(works.every((p) => p.authorId === "hafiz-rahman" && p.visibility === "publik")).toBe(
      true,
    );
    const times = works.map((p) => p.publishedAt);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("leaves out group posts even though they belong to the author", () => {
    const all = posts.filter((p) => p.authorId === "hafiz-rahman");
    expect(all.some((p) => p.visibility === "grup")).toBe(true);
    expect(publicWorks(posts, "hafiz-rahman").length).toBe(all.length - 1);
  });

  it("is empty for an author with nothing public", () => {
    expect(publicWorks(posts, "tidak-ada")).toEqual([]);
  });
});

describe("genresOf", () => {
  it("returns each genre once, in the fixed order", () => {
    const g = genresOf(publicWorks(posts, "hafiz-rahman"));
    expect(new Set(g).size).toBe(g.length);
    expect(genresOf([])).toEqual([]);
  });
});

describe("whereOf", () => {
  it("joins city and country, or gives the country alone", () => {
    expect(whereOf(author("aina-sofea"))).toBe("Kuala Lumpur, Malaysia");
    expect(whereOf(author("hafiz-rahman"))).toBe("Indonesia");
  });
});

describe("followerCount and followingCount", () => {
  it("adds the reader to the count only while the reader follows the author", () => {
    const base = profileOf("hafiz-rahman").followers;
    // Followed by default (DEFAULT_FOLLOWING), so the reader is already counted.
    expect(followerCount("hafiz-rahman", {})).toBe(base + 1);
    expect(followerCount("hafiz-rahman", { [mark.following("hafiz-rahman")]: false })).toBe(base);
    expect(followerCount("laras", {})).toBe(profileOf("laras").followers);
    expect(followerCount("laras", { [mark.following("laras")]: true })).toBe(
      profileOf("laras").followers + 1,
    );
  });

  it("never counts the reader as their own follower", () => {
    expect(followerCount(ME_ID, { [mark.following(ME_ID)]: true })).toBe(
      profileOf(ME_ID).followers,
    );
  });

  it("derives the reader's own 'following' from their marks, and reads it for others", () => {
    expect(followingCount(ME_ID, {})).toBe(4);
    expect(followingCount(ME_ID, { [mark.following("laras")]: true })).toBe(5);
    expect(followingCount(ME_ID, { [mark.following("hafiz-rahman")]: false })).toBe(3);
    expect(followingCount("hafiz-rahman", {})).toBe(profileOf("hafiz-rahman").following);
  });
});
