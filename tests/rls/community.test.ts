import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("RLS: Community", () => {
  let a: TestUser;
  let b: TestUser;
  let mod: TestUser;
  let publicPostId: string;
  let groupPostId: string;

  beforeAll(async () => {
    a = await createTestUser("comm-a");
    b = await createTestUser("comm-b");
    mod = await createTestUser("comm-mod");
    await admin.from("platform_roles").insert({ user_id: mod.id, role: "administrator" });
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  it("keeps drafts private and exposes published public posts to visitors and other users", async () => {
    const draftId = randomUUID();
    const pubId = randomUUID();
    publicPostId = pubId;

    const draft = await a.client.from("community_posts").insert({
      id: draftId,
      status: "draft",
      title: "Draf A",
      kind: "prolog",
      blocks: [{ type: "paragraph", text: "rahasia" }],
    });
    expect(draft.error).toBeNull();

    const pub = await a.client.from("community_posts").insert({
      id: pubId,
      status: "published",
      title: "Karya Publik A",
      kind: "cuplikan",
      genre: "Cerpen",
      visibility: "publik",
      blocks: [{ type: "paragraph", text: "terbit" }],
      published_at: new Date().toISOString(),
    });
    expect(pub.error).toBeNull();

    const bSees = await b.client.from("community_posts").select("id").in("id", [draftId, pubId]);
    expect(bSees.data?.map((r) => r.id)).toEqual([pubId]);

    const anonSees = await anonClient()
      .from("community_posts")
      .select("id")
      .in("id", [draftId, pubId]);
    expect(anonSees.data?.map((r) => r.id)).toEqual([pubId]);
  });

  it("restricts private group and group posts to members only", async () => {
    const gId = randomUUID();
    const grp = await a.client.from("writing_groups").insert({
      id: gId,
      name: "Lingkar Privat",
      visibility: "privat",
      code: `PRV-${randomUUID().slice(0, 6)}`,
    });
    expect(grp.error).toBeNull();

    const mem = await a.client.from("group_members").insert({
      group_id: gId,
      user_id: a.id,
      membership_id: `m-${a.id}`,
      is_admin: true,
    });
    expect(mem.error).toBeNull();

    groupPostId = randomUUID();
    const gp = await a.client.from("community_posts").insert({
      id: groupPostId,
      status: "published",
      title: "Post Grup",
      kind: "prolog",
      genre: "Cerpen",
      visibility: "grup",
      group_id: gId,
      blocks: [{ type: "paragraph", text: "khusus anggota" }],
      published_at: new Date().toISOString(),
    });
    expect(gp.error).toBeNull();

    // Non-member B cannot read the private group or its post.
    expect((await b.client.from("writing_groups").select("id").eq("id", gId)).data).toEqual([]);
    expect(
      (await b.client.from("community_posts").select("id").eq("id", groupPostId)).data,
    ).toEqual([]);

    // Non-member B cannot post into A's group.
    const spoof = await b.client.from("community_posts").insert({
      status: "published",
      title: "Penyusup",
      kind: "prolog",
      genre: "Cerpen",
      visibility: "grup",
      group_id: gId,
      blocks: [],
    });
    expect(spoof.error).not.toBeNull();

    // Non-member B cannot force-join a private group without an invite or approved request.
    const intrude = await b.client.from("group_members").insert({
      group_id: gId,
      user_id: b.id,
      membership_id: `m-${b.id}`,
      is_admin: true,
    });
    expect(intrude.error).not.toBeNull();
  });

  it("keeps marks private per user while exposing aggregate post counts", async () => {
    const ins = await b.client
      .from("community_marks")
      .insert([{ key: `ap:${publicPostId}` }, { key: `sv:${publicPostId}` }]);
    expect(ins.error).toBeNull();

    // A cannot read B's individual mark rows.
    const aMarks = await a.client
      .from("community_marks")
      .select("user_id, key")
      .eq("user_id", b.id);
    expect(aMarks.data).toEqual([]);

    const counts = await anonClient().rpc("community_post_counts", {
      p_post_ids: [publicPostId],
    });
    expect(counts.error).toBeNull();
    expect(counts.data?.[0]).toMatchObject({
      post_id: publicPostId,
      appreciations: 1,
      saves: 1,
    });
  });

  it("hides reporter identities from authors and lets admins moderate and curate", async () => {
    const rep = await b.client.from("community_reports").insert({
      kind: "post",
      target_id: publicPostId,
      reason: "spam",
    });
    expect(rep.error).toBeNull();

    // Post author A cannot see B's report.
    const aReads = await a.client
      .from("community_reports")
      .select("id")
      .eq("target_id", publicPostId);
    expect(aReads.data).toEqual([]);

    // Non-admin B cannot create moderation decisions or editor picks.
    const bDecide = await b.client.from("moderation_decisions").insert({
      kind: "post",
      target_id: publicPostId,
      decision: "sembunyikan",
    });
    expect(bDecide.error).not.toBeNull();

    const bPick = await b.client.from("editor_picks").insert({ post_id: publicPostId });
    expect(bPick.error).not.toBeNull();

    // Admin can curate and moderate; hiding removes the post from non-author feeds.
    const pick = await mod.client.from("editor_picks").insert({
      post_id: publicPostId,
      title: "Karya Publik A",
    });
    expect(pick.error).toBeNull();

    const hide = await mod.client.from("moderation_decisions").insert({
      kind: "post",
      target_id: publicPostId,
      decision: "sembunyikan",
      reason: "uji moderasi",
    });
    expect(hide.error).toBeNull();

    const bAfter = await b.client.from("community_posts").select("id").eq("id", publicPostId);
    expect(bAfter.data).toEqual([]);
  });

  it("enforces owner-only writes on public community-images bucket", async () => {
    const path = `${a.id}/post-1.png`;
    const up = await a.client.storage
      .from("community-images")
      .upload(path, PNG, { contentType: "image/png", upsert: true });
    expect(up.error).toBeNull();

    const publicUrl = anonClient().storage.from("community-images").getPublicUrl(path)
      .data.publicUrl;
    expect((await fetch(publicUrl)).status).toBe(200);

    const intoOther = await b.client.storage
      .from("community-images")
      .upload(`${a.id}/hijack.png`, PNG, { contentType: "image/png" });
    expect(intoOther.error).not.toBeNull();
  });
});
