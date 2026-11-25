import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_ACCOUNT,
  mergeAccount,
  parseAccount,
  resetAccount,
  saveAccount,
} from "@/features/account/account-store";
import { ownAuthor, ownProfileHref, showsSampleWorld } from "@/features/account/own-identity";
import { authorByHandle, authorOf } from "@/features/community/post-model";
import { isFollowing } from "@/features/community/feed";
import { ME_ID } from "@/features/community/fixtures/authors";
import { withoutSampleMe, groupSeeds } from "@/features/community/groups/group-store";
import { visibleFixtureNotifications } from "@/features/notifications/community-notifications";

const registered = mergeAccount(DEFAULT_ACCOUNT, {
  registered: true,
  profile: { name: "Rinjani Pratama", username: "rinjani_p", bio: "Halo." },
});

afterEach(() => {
  resetAccount();
});

describe("registered flag", () => {
  it("is absent on the dummy reader and survives parse and merge", () => {
    expect(DEFAULT_ACCOUNT.registered).toBeUndefined();
    expect(parseAccount(JSON.stringify(registered)).registered).toBe(true);
    expect(parseAccount(JSON.stringify({ registered: "yes" })).registered).toBeUndefined();
    expect(mergeAccount(registered, { email: "a@b.id" }).registered).toBe(true);
  });
});

describe("own identity", () => {
  it("keeps the sample world for the dummy reader only", () => {
    expect(showsSampleWorld(DEFAULT_ACCOUNT)).toBe(true);
    expect(showsSampleWorld(registered)).toBe(false);
    expect(ownProfileHref(DEFAULT_ACCOUNT)).toBe("/penulis/rinjaniputri");
  });

  it("follows the name and username of a registered account, keeping the id", () => {
    expect(ownAuthor(registered)).toMatchObject({
      id: ME_ID,
      name: "Rinjani Pratama",
      handle: "rinjani_p",
    });
    expect(ownProfileHref(registered)).toBe("/penulis/rinjani_p");
  });

  it("falls back while the profile is still empty", () => {
    const empty = mergeAccount(registered, { profile: { name: "", username: "" } });
    expect(ownAuthor(empty).name).toBe("Penulis");
    expect(ownAuthor(empty).handle).toBe(ME_ID);
  });

  it("resolves authors and handles through the account", () => {
    expect(authorOf(ME_ID, registered).name).toBe("Rinjani Pratama");
    expect(authorByHandle("rinjani_p", registered)?.id).toBe(ME_ID);
    expect(authorByHandle("rinjaniputri", registered)).toBeUndefined();
    expect(authorByHandle("rinjaniputri", DEFAULT_ACCOUNT)?.id).toBe(ME_ID);
    expect(authorByHandle("hafizrahman", registered)?.name).toBe("Hafiz Rahman");
  });
});

describe("a registered account starts empty", () => {
  it("follows nobody by default, unlike the dummy reader", () => {
    expect(isFollowing({}, "hafiz-rahman")).toBe(true);
    saveAccount({ registered: true });
    expect(isFollowing({}, "hafiz-rahman")).toBe(false);
  });

  it("has no sample notifications", () => {
    expect(visibleFixtureNotifications([], ME_ID, []).length).toBeGreaterThan(0);
    expect(visibleFixtureNotifications([], ME_ID, [], false)).toEqual([]);
  });

  it("is neither a member nor an invitee of the sample circles", () => {
    const sample = withoutSampleMe(groupSeeds);
    expect(sample).toHaveLength(groupSeeds.length);
    for (const group of sample) {
      expect(group.members.some((m) => m.authorId === ME_ID)).toBe(false);
      expect(group.invites.some((i) => i.authorId === ME_ID)).toBe(false);
    }
    expect(sample[0].members.some((m) => m.authorId === "hafiz-rahman")).toBe(true);
  });
});
