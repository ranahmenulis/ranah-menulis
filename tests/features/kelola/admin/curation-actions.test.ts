import { beforeEach, describe, expect, it } from "vitest";
import { editorPicks } from "@/features/community/curation/picks-store";
import { SEED_PICK_IDS } from "@/features/community/curation/seed-picks";
import { resolveFixturePosts } from "@/features/community/post-model";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { auditSentence } from "@/features/kelola/audit/audit-text";
import {
  addPick,
  movePick,
  removePick,
  setFeatured,
} from "@/features/kelola/admin/curation/curation-actions";
import {
  candidates,
  featuredRows,
  moveItem,
  pickRows,
} from "@/features/kelola/admin/curation/curation-model";
import {
  clearCommunityLink,
  saveCommunityLink,
} from "@/features/kelola/admin/settings/settings-actions";
import { validateCommunityLink } from "@/features/kelola/admin/settings/settings-model";
import { featuredProjects } from "@/features/projects/featured-store";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { platformSettings } from "@/lib/platform-settings";

const posts = resolveFixturePosts(Date.now());
const as = (roles: string) => sessionStorage.setItem("rm-roles", roles);
const publicPost = posts.find((p) => p.visibility === "publik" && !SEED_PICK_IDS.includes(p.id))!;
const groupPost = posts.find((p) => p.visibility === "grup")!;
const published = projectFixtures.find((p) => p.publication === "terbit")!;

beforeEach(() => {
  sessionStorage.clear();
  editorPicks.reset();
  featuredProjects.reset();
  platformSettings.reset();
  auditLog.reset();
});

describe("Editor's Picks", () => {
  it("starts from the example list, and an emptied list stays empty", () => {
    expect(editorPicks.read().map((p) => p.postId)).toEqual(SEED_PICK_IDS);
    as("administrator");
    for (const id of SEED_PICK_IDS) removePick(id);
    expect(editorPicks.read()).toHaveLength(0);
  });

  it("refuses anyone who is not an Administrator or Super Admin, and writes nothing", () => {
    as("editor");
    expect(addPick(publicPost.id, posts).ok).toBe(false);
    expect(removePick(SEED_PICK_IDS[0]).ok).toBe(false);
    expect(movePick(SEED_PICK_IDS[1], -1).ok).toBe(false);
    expect(editorPicks.read().map((p) => p.postId)).toEqual(SEED_PICK_IDS);
    expect(auditLog.read()).toHaveLength(0);
  });

  it("adds a public post once, in last place, and logs it with the title", () => {
    as("administrator");
    expect(addPick(publicPost.id, posts).ok).toBe(true);
    expect(editorPicks.read().at(-1)?.postId).toBe(publicPost.id);
    expect(addPick(publicPost.id, posts).ok).toBe(false);
    expect(auditLog.read()).toHaveLength(1);
    expect(auditSentence(auditLog.read()[0])).toContain(`"${publicPost.title}" ke Editor's Picks`);
  });

  it("refuses a group post and a post it was not given", () => {
    as("super-admin");
    expect(addPick(groupPost.id, posts).ok).toBe(false);
    expect(addPick("tidak-ada", posts).ok).toBe(false);
    expect(auditLog.read()).toHaveLength(0);
  });

  it("moves a pick up and refuses at the edge", () => {
    as("administrator");
    expect(movePick(SEED_PICK_IDS[1], -1).ok).toBe(true);
    expect(editorPicks.read()[0].postId).toBe(SEED_PICK_IDS[1]);
    expect(movePick(SEED_PICK_IDS[1], -1).ok).toBe(false);
    expect(auditLog.read()).toHaveLength(1);
  });

  it("keeps a pick whose post is no longer public, marked as not shown", () => {
    const rows = pickRows(
      editorPicks.read(),
      posts.filter((p) => p.id !== SEED_PICK_IDS[0]),
    );
    expect(rows[0]).toMatchObject({ postId: SEED_PICK_IDS[0], shown: false });
    expect(rows[1].shown).toBe(true);
  });

  it("offers only public posts that are not picked, narrowed by search", () => {
    const all = candidates(posts, editorPicks.read(), "");
    expect(all.every((p) => p.visibility === "publik")).toBe(true);
    expect(all.some((p) => SEED_PICK_IDS.includes(p.id))).toBe(false);
    expect(candidates(posts, editorPicks.read(), "zzzz-tidak-ada")).toHaveLength(0);
  });

  it("swaps neighbours and leaves a list at the edge alone", () => {
    expect(moveItem([1, 2, 3], 2, -1)).toEqual([1, 3, 2]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
  });
});

describe("featured projects", () => {
  it("marks a published project once and releases it, logging both", () => {
    as("administrator");
    expect(setFeatured(published.slug, true, projectFixtures).ok).toBe(true);
    expect(setFeatured(published.slug, true, projectFixtures).ok).toBe(false);
    expect(featuredRows(projectFixtures, featuredProjects.read())[0]).toMatchObject({
      slug: published.slug,
      featured: true,
    });
    expect(setFeatured(published.slug, false, projectFixtures).ok).toBe(true);
    expect(featuredProjects.read()).toHaveLength(0);
    expect(auditLog.read().map((e) => e.action)).toEqual(["featured.add", "featured.remove"]);
  });

  it("refuses a draft or unknown project and a wrong role", () => {
    const draft = { ...published, slug: "draf-x", publication: "draf" as const };
    as("administrator");
    expect(setFeatured("draf-x", true, [draft]).ok).toBe(false);
    expect(setFeatured("tidak-ada", true, projectFixtures).ok).toBe(false);
    as("organizer");
    expect(setFeatured(published.slug, true, projectFixtures).ok).toBe(false);
    expect(featuredProjects.read()).toHaveLength(0);
  });
});

describe("community link", () => {
  it("accepts only a full https address", () => {
    expect(validateCommunityLink("")).toBe("kosong");
    expect(validateCommunityLink("discord.gg/abc")).toBe("bukan-https");
    expect(validateCommunityLink("http://discord.gg/abc")).toBe("bukan-https");
    expect(validateCommunityLink("javascript:alert(1)")).toBe("bukan-https");
    expect(validateCommunityLink(`https://x.id/${"a".repeat(200)}`)).toBe("terlalu-panjang");
    expect(validateCommunityLink(" https://discord.gg/abc ")).toBeNull();
  });

  it("saves, logs without copying the address, and clears", () => {
    as("super-admin");
    expect(saveCommunityLink(" https://discord.gg/abc ").ok).toBe(true);
    expect(platformSettings.read()[0].communityLink).toBe("https://discord.gg/abc");
    expect(JSON.stringify(auditLog.read())).not.toContain("discord");
    expect(clearCommunityLink().ok).toBe(true);
    expect(platformSettings.read()).toHaveLength(0);
    expect(clearCommunityLink().ok).toBe(false);
  });

  it("refuses a wrong role and a bad address, and drops an unsafe stored value", () => {
    as("mentor");
    expect(saveCommunityLink("https://discord.gg/abc").ok).toBe(false);
    as("administrator");
    expect(saveCommunityLink("ftp://x").ok).toBe(false);
    expect(platformSettings.read()).toHaveLength(0);
    localStorage.setItem(
      "ranah.platformSettings",
      JSON.stringify([{ communityLink: "javascript:x" }]),
    );
    platformSettings.reset();
    localStorage.setItem(
      "ranah.platformSettings",
      JSON.stringify([{ communityLink: "javascript:x" }]),
    );
    expect(platformSettings.read()).toHaveLength(0);
  });
});
