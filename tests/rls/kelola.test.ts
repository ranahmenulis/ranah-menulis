import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

describe("RLS: Kelola & Contest Judging", () => {
  let writerA: TestUser;
  let writerB: TestUser;
  let organizer: TestUser;
  let judgeA: TestUser;
  let judgeB: TestUser;
  let adm: TestUser;
  let superAdm: TestUser;

  const suffix = randomUUID().slice(0, 8);
  const contestSlug = `rls-lomba-${suffix}`;
  const settingKey = `rls_test_key_${suffix}`;
  const featuredSlug = `rls-feat-${suffix}`;
  let entryId: string;

  beforeAll(async () => {
    [writerA, writerB, organizer, judgeA, judgeB, adm, superAdm] = await Promise.all([
      createTestUser("kel-a"),
      createTestUser("kel-b"),
      createTestUser("kel-org"),
      createTestUser("kel-j1"),
      createTestUser("kel-j2"),
      createTestUser("kel-adm"),
      createTestUser("kel-sa"),
    ]);
    await admin.from("platform_roles").insert([
      { user_id: adm.id, role: "administrator" },
      { user_id: superAdm.id, role: "super_admin" },
    ]);
    await admin.from("staff_roles").insert([
      { user_id: organizer.id, role: "organizer", granted_by: adm.id },
      { user_id: judgeA.id, role: "juri", granted_by: adm.id },
      { user_id: judgeB.id, role: "juri", granted_by: adm.id },
    ]);
    await organizer.client.from("projects").insert({
      slug: contestSlug,
      category: "lomba",
      publication: "terbit",
      title: "Lomba Anonim RLS",
      block: {
        kind: "lomba",
        criteria: [{ name: "Gaya", weight: 100 }],
        prizes: ["Juara 1"],
        anonymous: true,
      },
    });
    await organizer.client.from("staff_assignments").insert([
      { project_slug: contestSlug, role: "juri", staff_id: judgeA.id, assigned_by: organizer.id },
      { project_slug: contestSlug, role: "juri", staff_id: judgeB.id, assigned_by: organizer.id },
    ]);
    entryId = randomUUID();
    await writerA.client.from("project_submissions").insert({
      id: entryId,
      slug: contestSlug,
      title: "Karya Lomba A",
      genre: "Cerpen",
      note: "Catatan rahasia untuk editor",
      doc_id: randomUUID(),
      doc_title: "Cerpen A",
      status: "terkirim",
    });
  });

  afterAll(async () => {
    await admin.from("projects").delete().eq("slug", contestSlug);
    await admin.from("staff_assignments").delete().eq("project_slug", contestSlug);
    await admin.from("contest_stages").delete().eq("slug", contestSlug);
    await admin.from("contest_results").delete().eq("slug", contestSlug);
    await admin.from("judging_log").delete().eq("slug", contestSlug);
    await admin.from("featured_projects").delete().eq("slug", featuredSlug);
    await admin.from("platform_settings").delete().eq("key", settingKey);
    await cleanupTestUsers();
  });

  it("restricts staff_roles and account_suspensions writes to Admin/Super Admin RPCs", async () => {
    const selfGrant = await writerA.client.rpc("grant_staff_role", {
      p_target: writerA.id,
      p_role: "organizer",
    });
    expect(selfGrant.error).not.toBeNull();

    const admGrant = await adm.client.rpc("grant_staff_role", {
      p_target: writerB.id,
      p_role: "editor",
      p_reason: "Uji peran",
    });
    expect(admGrant.error).toBeNull();

    const admRevoke = await adm.client.rpc("revoke_staff_role", {
      p_target: writerB.id,
      p_role: "editor",
      p_reason: "Selesai uji",
    });
    expect(admRevoke.error).toBeNull();

    // Admin cannot suspend a Super Admin
    const suspendSuper = await adm.client.rpc("suspend_account", {
      p_target: superAdm.id,
      p_reason: "Tidak boleh",
    });
    expect(suspendSuper.error).not.toBeNull();

    // Admin can suspend and restore a plain writer
    const suspendB = await adm.client.rpc("suspend_account", {
      p_target: writerB.id,
      p_reason: "Pelanggaran uji",
    });
    expect(suspendB.error).toBeNull();
    const restoreB = await adm.client.rpc("restore_account", {
      p_target: writerB.id,
      p_reason: "Pulihkan uji",
    });
    expect(restoreB.error).toBeNull();
  });

  it("keeps anonymous contest authors hidden from judges and locks scores when judging closes", async () => {
    // Judge cannot select directly from project_submissions (prevents author_id/note leak)
    const direct = await judgeA.client.from("project_submissions").select("id").eq("id", entryId);
    expect(direct.data).toEqual([]);

    // Judge reads via jury_submissions RPC without author_id or note
    const anonList = await judgeA.client.rpc("jury_submissions", { p_slug: contestSlug });
    expect(anonList.error).toBeNull();
    expect(anonList.data?.length).toBe(1);
    expect(anonList.data?.[0].id).toBe(entryId);
    expect("author_id" in (anonList.data?.[0] ?? {})).toBe(false);
    expect("note" in (anonList.data?.[0] ?? {})).toBe(false);

    // Judge A scores; Judge B cannot read Judge A's score; Organizer can read all scores
    const scoreA = await judgeA.client.from("jury_scores").insert({
      submission_id: entryId,
      slug: contestSlug,
      scores: { Gaya: 9 },
      note: "Bagus",
    });
    expect(scoreA.error).toBeNull();

    const bSeesScores = await judgeB.client
      .from("jury_scores")
      .select("judge_id")
      .eq("slug", contestSlug);
    expect(bSeesScores.data).toEqual([]);

    const orgSeesScores = await organizer.client
      .from("jury_scores")
      .select("judge_id")
      .eq("slug", contestSlug);
    expect(orgSeesScores.data?.map((r) => r.judge_id)).toEqual([judgeA.id]);

    // Organizer closes judging -> Judge B is blocked from scoring
    const close = await organizer.client.from("judging_log").insert({
      slug: contestSlug,
      state: "ditutup",
    });
    expect(close.error).toBeNull();

    const scoreAfterClose = await judgeB.client.from("jury_scores").insert({
      submission_id: entryId,
      slug: contestSlug,
      scores: { Gaya: 8 },
    });
    expect(scoreAfterClose.error).not.toBeNull();

    // Organizer cannot reopen judging; Admin can reopen with a mandatory note
    const orgReopen = await organizer.client.from("judging_log").insert({
      slug: contestSlug,
      state: "dibuka",
      note: "Coba buka",
    });
    expect(orgReopen.error).not.toBeNull();

    const admReopenNoNote = await adm.client.from("judging_log").insert({
      slug: contestSlug,
      state: "dibuka",
      note: "",
    });
    expect(admReopenNoNote.error).not.toBeNull();

    const admReopen = await adm.client.from("judging_log").insert({
      slug: contestSlug,
      state: "dibuka",
      note: "Ada juri susulan",
    });
    expect(admReopen.error).toBeNull();
  });

  it("hides contest results until stage advances to finalis or pemenang", async () => {
    await organizer.client.from("contest_stages").upsert({
      slug: contestSlug,
      stage: "dinilai",
      times: {},
    });
    await organizer.client.from("contest_results").upsert({
      slug: contestSlug,
      finalists: [{ id: entryId, title: "Karya Lomba A", genre: "Cerpen", authorId: writerA.id }],
      winners: [],
    });

    expect(
      (await anonClient().from("contest_results").select("slug").eq("slug", contestSlug)).data,
    ).toEqual([]);

    await organizer.client
      .from("contest_stages")
      .update({ stage: "finalis" })
      .eq("slug", contestSlug);

    expect(
      (await anonClient().from("contest_results").select("slug").eq("slug", contestSlug)).data
        ?.length,
    ).toBe(1);
  });

  it("isolates bug reports per reporter and restricts platform settings/featured to Admin", async () => {
    const repId = randomUUID();
    const rep = await writerA.client.from("bug_reports").insert({
      id: repId,
      category: "save",
      description: "Simpan gagal saat offline",
    });
    expect(rep.error).toBeNull();

    expect((await writerB.client.from("bug_reports").select("id").eq("id", repId)).data).toEqual(
      [],
    );
    expect((await adm.client.from("bug_reports").select("id").eq("id", repId)).data?.length).toBe(
      1,
    );

    const logRes = await adm.client.from("bug_report_log").insert({
      report_id: repId,
      status: "diproses",
      note: "Sedang dicek",
    });
    expect(logRes.error).toBeNull();

    expect(
      (await writerA.client.from("platform_settings").insert({ key: settingKey, value: {} })).error,
    ).not.toBeNull();
    expect(
      (await adm.client.from("platform_settings").insert({ key: settingKey, value: {} })).error,
    ).toBeNull();

    expect(
      (await writerA.client.from("featured_projects").insert({ slug: featuredSlug })).error,
    ).not.toBeNull();
    expect(
      (await adm.client.from("featured_projects").insert({ slug: featuredSlug })).error,
    ).toBeNull();

    // Cross-slug spoofing: judgeA cannot score entryId under another slug
    const otherSlug = `rls-other-${suffix}`;
    await organizer.client.from("projects").insert({
      slug: otherSlug,
      category: "lomba",
      publication: "terbit",
      title: "Lomba Lain",
      block: {
        kind: "lomba",
        criteria: [{ name: "Gaya", weight: 100 }],
        prizes: [],
        anonymous: false,
      },
    });
    await organizer.client.from("staff_assignments").insert({
      project_slug: otherSlug,
      role: "juri",
      staff_id: judgeA.id,
      assigned_by: organizer.id,
    });
    const crossScore = await judgeA.client.from("jury_scores").insert({
      submission_id: entryId,
      slug: otherSlug,
      scores: { Gaya: 10 },
    });
    expect(crossScore.error).not.toBeNull();
    await admin.from("projects").delete().eq("slug", otherSlug);
    await admin.from("staff_assignments").delete().eq("project_slug", otherSlug);
  });
});
