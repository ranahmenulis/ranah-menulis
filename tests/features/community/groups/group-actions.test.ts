import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ME_ID } from "@/features/kelola/identity";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { suspensions } from "@/features/kelola/admin/role-store";
import { canRead } from "@/features/community/feed";
import {
  inviteToGroup,
  joinByCode,
  joinGroup,
  removeGroupMember,
  rotateGroupCode,
  saveGroup,
  setGroupAdmin,
} from "@/features/community/groups/group-actions";
import { hideGroupPost, shareProgress } from "@/features/community/groups/group-content-actions";
import { COASTAL_GROUP_ID, memberOf } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";
import { resolveFixturePosts } from "@/features/community/post-model";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { splitSaved } from "@/features/saved/saved-list";
import type { StudioDocument } from "@/features/studio/storage/document-store";

const admin = () => sessionStorage.setItem("rm-roles", "administrator");
const group = (id: string) => writingGroups.read().find((item) => item.id === id)!;
const privateInput = {
  name: "Ruang Teduh",
  description: "Cuplikan cerpen.",
  visibility: "privat" as const,
};
const ownGroup = () => saveGroup(privateInput).id!;

function reset() {
  sessionStorage.clear();
  writingGroups.reset();
  auditLog.reset();
  suspensions.reset();
}

beforeEach(reset);
afterEach(reset);

describe("group membership and administration", () => {
  it("creates a private group immediately and validates input and the current viewer", () => {
    expect(saveGroup({ ...privateInput, name: "" }).ok).toBe(false);
    expect(saveGroup({ ...privateInput, name: "x".repeat(41) }).ok).toBe(false);
    const id = ownGroup();
    expect(memberOf(group(id), ME_ID)?.admin).toBe(true);
    expect(group(id).visibility).toBe("privat");
    expect(auditLog.read().at(-1)).toMatchObject({ actorId: ME_ID, action: "group.create" });
    sessionStorage.setItem("rm-viewer", "tamu");
    expect(saveGroup(privateInput).ok).toBe(false);
    expect(inviteToGroup(id, "hafiz-rahman").ok).toBe(false);
  });

  it("joins via public listing, direct invite or valid code without duplicating members", () => {
    expect(joinGroup(COASTAL_GROUP_ID, { type: "public" }).ok).toBe(false);
    expect(joinByCode("no-match").ok).toBe(false);
    expect(joinGroup("ruang-cerpen", { type: "invite" }).ok).toBe(true);
    expect(group("ruang-cerpen").invites).toEqual([]);
    expect(joinGroup("ruang-cerpen", { type: "public" }).ok).toBe(true);
    expect(group("ruang-cerpen").members.filter((item) => item.authorId === ME_ID)).toHaveLength(1);
    expect(removeGroupMember(COASTAL_GROUP_ID, ME_ID).ok).toBe(true);
    expect(joinByCode(" pesisir26 ")).toMatchObject({ ok: true, id: COASTAL_GROUP_ID });
  });

  it("rotates codes and allows the last group admin to leave", () => {
    const id = ownGroup();
    const { code } = group(id);
    expect(rotateGroupCode(id).ok).toBe(true);
    expect(group(id).code).not.toBe(code);
    expect(removeGroupMember(id, ME_ID).ok).toBe(true);
    expect(group(id).members).toEqual([]);
    expect(joinByCode(code).ok).toBe(false);
    expect(joinByCode(group(id).code).ok).toBe(true);
    expect(memberOf(group(id), ME_ID)?.admin).toBe(false);
  });

  it("rejects stale settings that would make a newly private group public", () => {
    const id = saveGroup({ ...privateInput, visibility: "publik" }).id!;
    const original = group(id);
    expect(saveGroup({ ...original, visibility: "privat" }, { original }).ok).toBe(true);
    const count = auditLog.read().length;

    expect(saveGroup({ ...original, name: "Nama di tab lama" }, { original }).ok).toBe(false);
    expect(group(id)).toMatchObject({ name: original.name, visibility: "privat" });
    expect(auditLog.read()).toHaveLength(count);
  });

  it("lets platform admins appoint multiple group admins and checks group ownership at click time", () => {
    expect(inviteToGroup(COASTAL_GROUP_ID, "maya-anindita").ok).toBe(false);
    expect(setGroupAdmin(COASTAL_GROUP_ID, ME_ID, true).ok).toBe(false);
    admin();
    expect(setGroupAdmin(COASTAL_GROUP_ID, ME_ID, true).ok).toBe(true);
    expect(group(COASTAL_GROUP_ID).members.filter((item) => item.admin)).toHaveLength(2);
    sessionStorage.removeItem("rm-roles");
    expect(inviteToGroup(COASTAL_GROUP_ID, "maya-anindita").ok).toBe(true);
    expect(inviteToGroup("ruang-cerpen", "maya-anindita").ok).toBe(false);
    expect(setGroupAdmin(COASTAL_GROUP_ID, "hafiz-rahman", false, "Reason").ok).toBe(false);
    expect(removeGroupMember(COASTAL_GROUP_ID, "hafiz-rahman", "Reason").ok).toBe(false);
    admin();
    expect(setGroupAdmin(COASTAL_GROUP_ID, "hafiz-rahman", false, "").ok).toBe(false);
    expect(removeGroupMember(COASTAL_GROUP_ID, "hafiz-rahman", "Pindah grup").ok).toBe(true);
    expect(auditLog.read().at(-1)).toMatchObject({
      action: "group.remove",
      targetId: "hafiz-rahman",
      reason: "Pindah grup",
    });
  });
});

describe("group content privacy", () => {
  const fixture = resolveFixturePosts(10).find((item) => item.id === "garam-dan-pelabuhan")!;

  it("requires current membership for links and saved posts, even for a platform admin", () => {
    expect(canRead(fixture, writingGroups.read(), ME_ID)).toBe(true);
    admin();
    removeGroupMember(COASTAL_GROUP_ID, ME_ID);
    expect(canRead(fixture, writingGroups.read(), ME_ID)).toBe(false);
    expect(splitSaved([fixture.id], [fixture], writingGroups.read(), ME_ID).unavailable).toEqual([
      fixture.id,
    ]);
  });

  it("keeps contributions unavailable after the author leaves and joins again", () => {
    const membership = memberOf(group(COASTAL_GROUP_ID), ME_ID)!;
    const own = {
      ...fixture,
      authorId: ME_ID,
      groupId: COASTAL_GROUP_ID,
      groupMembershipId: membership.membershipId,
    };
    expect(canRead(own, writingGroups.read(), "hafiz-rahman")).toBe(true);
    removeGroupMember(COASTAL_GROUP_ID, ME_ID);
    joinByCode(group(COASTAL_GROUP_ID).code);
    expect(canRead(own, writingGroups.read(), "hafiz-rahman")).toBe(false);
    expect(canRead({ ...fixture, groupName: "Unmapped" }, writingGroups.read(), ME_ID)).toBe(false);
  });

  it("lets a manager hide only posts from that group and audits the reason", async () => {
    const posts = createMemoryPostStore();
    expect((await hideGroupPost(COASTAL_GROUP_ID, fixture.id, "Di luar topik", posts)).ok).toBe(
      false,
    );
    admin();
    expect((await hideGroupPost("ruang-cerpen", fixture.id, "Di luar topik", posts)).ok).toBe(
      false,
    );
    expect((await hideGroupPost(COASTAL_GROUP_ID, fixture.id, "Di luar topik", posts)).ok).toBe(
      true,
    );
    expect(canRead(fixture, writingGroups.read(), ME_ID)).toBe(false);
    expect(auditLog.read().at(-1)).toMatchObject({
      action: "group.post.hide",
      ref: `post:${fixture.id}`,
    });
  });

  it("shares only the confirmed snapshot of an active Studio document and revokes it on departure", async () => {
    const doc: StudioDocument = {
      id: "draft",
      title: "Buku baru",
      wordCount: 7,
      version: 2,
      updatedAt: 1,
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Teks pribadi." }] }],
      },
    };
    const store = { get: vi.fn().mockResolvedValue(doc) };
    expect((await shareProgress(COASTAL_GROUP_ID, { id: doc.id, version: 1 }, store)).ok).toBe(
      false,
    );
    expect((await shareProgress("ruang-cerpen", doc, store)).ok).toBe(false);
    expect((await shareProgress(COASTAL_GROUP_ID, doc, store)).ok).toBe(true);
    expect(group(COASTAL_GROUP_ID).progress[0]).toMatchObject({
      title: "Buku baru",
      words: 7,
      username: "rinjaniputri",
    });
    expect(JSON.stringify(group(COASTAL_GROUP_ID).progress)).not.toContain("Teks pribadi.");
    removeGroupMember(COASTAL_GROUP_ID, ME_ID);
    expect(group(COASTAL_GROUP_ID).progress).toEqual([]);
  });

  it("does not attach pending progress to a new membership after rejoining", async () => {
    const doc: StudioDocument = {
      id: "draft",
      title: "Draf lama",
      wordCount: 7,
      version: 1,
      updatedAt: 1,
      content: { type: "doc" },
    };
    const store = {
      async get() {
        expect(removeGroupMember(COASTAL_GROUP_ID, ME_ID).ok).toBe(true);
        expect(joinByCode(group(COASTAL_GROUP_ID).code).ok).toBe(true);
        return doc;
      },
    };

    expect((await shareProgress(COASTAL_GROUP_ID, doc, store)).ok).toBe(false);
    expect(group(COASTAL_GROUP_ID).progress).toEqual([]);
  });
});
