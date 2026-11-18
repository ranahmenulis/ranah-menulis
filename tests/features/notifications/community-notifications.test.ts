import { describe, expect, it } from "vitest";
import type { ModerationEntry, Report } from "@/features/community/moderation/report-store";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { resolveFixturePosts } from "@/features/community/post-model";
import { ME_ID } from "@/features/kelola/identity";
import {
  hiddenNotifications,
  pickNotification,
  reportNotifications,
  visibleFixtureNotifications,
} from "@/features/notifications/community-notifications";

const ownPost = resolveFixturePosts(0).find((post) => post.id === "hujan-pertama-bulan-november")!;
const hide: ModerationEntry = {
  kind: "post",
  targetId: ownPost.id,
  decision: "sembunyikan",
  at: 10,
  by: "moderator",
};

describe("community notifications", () => {
  it("groups an active case without reporter identity, then gives a reopened case a fresh id", () => {
    const first: Report = {
      kind: "post",
      targetId: ownPost.id,
      reporterId: "private-reporter",
      reason: "spam",
      at: 1,
    };
    const second = { ...first, reporterId: "another-reporter", at: 2 };
    const [item] = reportNotifications([first], [], ["administrator"]);
    expect(reportNotifications([first, second], [], ["super-admin"])).toEqual([item]);
    expect(JSON.stringify(item)).not.toContain(first.reporterId);
    expect(item.href).toBe(`/kelola/admin/moderasi/post%3A${ownPost.id}`);
    expect(reportNotifications([first], [], ["organizer"])).toEqual([]);
    expect(reportNotifications([first, second], [hide], ["administrator"])).toEqual([]);
    const [reopened] = reportNotifications(
      [first, { ...second, at: 11 }],
      [hide],
      ["administrator"],
    );
    expect(reopened.id).not.toBe(item.id);
  });

  it("tells only the owner about hidden content without sending them to its title or URL", async () => {
    const store = createMemoryPostStore();
    await store.putComment({
      id: "owned",
      postId: ownPost.id,
      parentId: null,
      text: "Private comment text",
      authorId: ME_ID,
      createdAt: 5,
    });
    const comment: ModerationEntry = { ...hide, kind: "comment", targetId: "owned" };
    const unrelated = { ...hide, targetId: "toples-kerupuk" };
    const missing = { ...hide, targetId: "missing" };
    const items = await hiddenNotifications(store, [hide, comment, unrelated, missing]);
    expect(items.map((item) => item.text)).toEqual([
      "Tulisanmu disembunyikan oleh moderator.",
      "Komentarmu disembunyikan oleh moderator.",
    ]);
    expect(items.every((item) => !item.href && !item.actorId)).toBe(true);
    expect(
      await hiddenNotifications(store, [hide, { ...hide, decision: "pulihkan", at: 20 }]),
    ).toEqual([]);
    expect(
      await hiddenNotifications(store, [hide, { ...hide, decision: "hapus", at: 20 }]),
    ).toEqual([]);
  });

  it("reads the current title of a public pick and withholds it after its access changes", () => {
    const pick = { postId: ownPost.id, title: "Stale audit title", at: 4 };
    expect(pickNotification(pick, ownPost, [])[0].text).toContain(ownPost.title);
    expect(pickNotification(pick, ownPost, [hide])).toEqual([]);
    expect(pickNotification(pick, { ...ownPost, visibility: "grup" }, [])).toEqual([]);
    expect(pickNotification(pick, { ...ownPost, authorId: "another-author" }, [])).toEqual([]);
    expect(pickNotification({ ...pick, at: 0 }, ownPost, [])).toEqual([]);
    expect(
      visibleFixtureNotifications([], ME_ID, [hide]).some((item) =>
        item.href?.endsWith(ownPost.id),
      ),
    ).toBe(false);
  });
});
