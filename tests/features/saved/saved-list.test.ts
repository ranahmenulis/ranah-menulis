import { describe, expect, it } from "vitest";
import { resolveFixturePosts } from "@/features/community/post-model";
import { mark } from "@/features/community/storage/post-store";
import { savedPostIds, splitSaved } from "@/features/saved/saved-list";

const posts = resolveFixturePosts(Date.now());

describe("savedPostIds", () => {
  it("lists only posts whose save mark is on", () => {
    const marks = {
      [mark.saved("a")]: true,
      [mark.saved("b")]: false,
      [mark.appreciated("c")]: true,
      [mark.following("d")]: true,
    };
    expect(savedPostIds(marks)).toEqual(["a"]);
  });

  it("is empty when nothing was saved", () => {
    expect(savedPostIds({})).toEqual([]);
  });
});

describe("splitSaved", () => {
  it("returns posts newest first, whatever order they were saved in", () => {
    const [old, recent] = [...posts].sort((a, b) => a.publishedAt - b.publishedAt).slice(0, 2);
    const { available } = splitSaved([recent.id, old.id].reverse(), posts);
    expect(available.map((p) => p.id)).toEqual(
      [old, recent].sort((a, b) => b.publishedAt - a.publishedAt).map((p) => p.id),
    );
  });

  it("puts ids that lead nowhere aside instead of dropping them (PRD COM-06)", () => {
    const real = posts[0].id;
    const { available, unavailable } = splitSaved([real, "sudah-ditarik"], posts);
    expect(available.map((p) => p.id)).toEqual([real]);
    expect(unavailable).toEqual(["sudah-ditarik"]);
  });

  it("treats a group post the reader cannot read as unavailable", () => {
    const outsider = {
      ...posts[0],
      id: "grup-lain",
      visibility: "grup" as const,
      groupName: "Grup yang Bukan Milikku",
    };
    expect(splitSaved(["grup-lain"], [outsider]).unavailable).toEqual(["grup-lain"]);
  });
});
