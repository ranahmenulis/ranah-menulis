import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("RLS: Projects", () => {
  let writerA: TestUser;
  let writerB: TestUser;
  let organizer: TestUser;
  let editor: TestUser;
  let otherEditor: TestUser;
  let mentor: TestUser;
  let adm: TestUser;

  const suffix = randomUUID().slice(0, 8);
  const draftSlug = `rls-draf-${suffix}`;
  const pubSlug = `rls-pub-${suffix}`;
  const classSlug = `rls-kelas-${suffix}`;
  const soloSlug = `rls-solo-${suffix}`;
  let soloSubmissionId: string;

  beforeAll(async () => {
    [writerA, writerB, organizer, editor, otherEditor, mentor, adm] = await Promise.all([
      createTestUser("prj-a"),
      createTestUser("prj-b"),
      createTestUser("prj-org"),
      createTestUser("prj-ed"),
      createTestUser("prj-ed2"),
      createTestUser("prj-mnt"),
      createTestUser("prj-adm"),
    ]);
    await admin.from("platform_roles").insert({ user_id: adm.id, role: "administrator" });
    await admin.from("staff_roles").insert([
      { user_id: organizer.id, role: "organizer", granted_by: adm.id },
      { user_id: editor.id, role: "editor", granted_by: adm.id },
      { user_id: otherEditor.id, role: "editor", granted_by: adm.id },
      { user_id: mentor.id, role: "mentor", granted_by: adm.id },
    ]);
  });

  afterAll(async () => {
    await admin.from("projects").delete().in("slug", [draftSlug, pubSlug, classSlug, soloSlug]);
    await admin
      .from("staff_assignments")
      .delete()
      .in("project_slug", [draftSlug, pubSlug, classSlug, soloSlug]);
    await cleanupTestUsers();
  });

  it("hides drafts from public/writers and restricts project creation to Organizer/Admin", async () => {
    const denied = await writerA.client.from("projects").insert({
      slug: draftSlug,
      category: "antologi",
      publication: "draf",
      title: "Draf ilegal",
      block: { kind: "antologi", theme: "Uji", stages: [] },
    });
    expect(denied.error).not.toBeNull();

    const made = await organizer.client.from("projects").insert([
      {
        slug: draftSlug,
        category: "antologi",
        publication: "draf",
        title: "Antologi Draf",
        block: { kind: "antologi", theme: "Uji", stages: [] },
      },
      {
        slug: pubSlug,
        category: "antologi",
        publication: "terbit",
        title: "Antologi Terbit",
        block: { kind: "antologi", theme: "Uji", stages: [] },
      },
      {
        slug: classSlug,
        category: "kelas",
        publication: "terbit",
        title: "Kelas Uji",
        block: { kind: "kelas", teacher: { name: "Mentor", bio: "" }, modules: [] },
      },
      {
        slug: soloSlug,
        category: "solo",
        publication: "terbit",
        title: "Solo Uji",
        block: { kind: "solo", packages: [] },
      },
    ]);
    expect(made.error).toBeNull();

    const anonSees = await anonClient()
      .from("projects")
      .select("slug")
      .in("slug", [draftSlug, pubSlug]);
    expect(anonSees.data?.map((r) => r.slug)).toEqual([pubSlug]);

    const writerSees = await writerA.client
      .from("projects")
      .select("slug")
      .in("slug", [draftSlug, pubSlug]);
    expect(writerSees.data?.map((r) => r.slug)).toEqual([pubSlug]);

    const orgSees = await organizer.client
      .from("projects")
      .select("slug")
      .in("slug", [draftSlug, pubSlug]);
    expect(orgSees.data?.map((r) => r.slug).sort()).toEqual([draftSlug, pubSlug].sort());
  });

  it("isolates registrations per participant while allowing Organizer and Admin access", async () => {
    const reg = await writerA.client.from("project_registrations").insert({
      slug: pubSlug,
      status: "terdaftar",
      terms_version: "v1",
    });
    expect(reg.error).toBeNull();

    const bSees = await writerB.client
      .from("project_registrations")
      .select("id")
      .eq("slug", pubSlug);
    expect(bSees.data).toEqual([]);

    const orgSees = await organizer.client
      .from("project_registrations")
      .select("user_id")
      .eq("slug", pubSlug);
    expect(orgSees.data?.map((r) => r.user_id)).toEqual([writerA.id]);
  });

  it("allows assigned Editor to review submissions while blocking other writers and unassigned Editors", async () => {
    const assign = await organizer.client.from("staff_assignments").insert({
      project_slug: soloSlug,
      role: "editor",
      staff_id: editor.id,
      assigned_by: organizer.id,
    });
    expect(assign.error).toBeNull();

    soloSubmissionId = randomUUID();
    const sub = await writerA.client.from("project_submissions").insert({
      id: soloSubmissionId,
      slug: soloSlug,
      title: "Naskah Solo A",
      genre: "Novel",
      doc_id: randomUUID(),
      doc_title: "Bab 1",
      status: "terkirim",
    });
    expect(sub.error).toBeNull();

    const bSees = await writerB.client
      .from("project_submissions")
      .select("id")
      .eq("id", soloSubmissionId);
    expect(bSees.data).toEqual([]);

    const unassignedSees = await otherEditor.client
      .from("project_submissions")
      .select("id")
      .eq("id", soloSubmissionId);
    expect(unassignedSees.data).toEqual([]);

    const edReview = await editor.client
      .from("project_submissions")
      .update({ status: "peninjauan" })
      .eq("id", soloSubmissionId);
    expect(edReview.error).toBeNull();

    const edUpdate = await editor.client
      .from("project_submissions")
      .update({ status: "diterima" })
      .eq("id", soloSubmissionId);
    expect(edUpdate.error).toBeNull();
  });

  it("enforces Kelas Menulis RLS for mentor tasks, assignments, and hidden testimonials", async () => {
    await organizer.client.from("staff_assignments").insert({
      project_slug: classSlug,
      role: "mentor",
      staff_id: mentor.id,
      assigned_by: organizer.id,
    });
    await writerA.client.from("project_registrations").insert({
      slug: classSlug,
      status: "terdaftar",
      terms_version: "v1",
    });

    const taskId = `task-${suffix}`;
    const task = await mentor.client.from("mentor_tasks").insert({
      id: taskId,
      slug: classSlug,
      title: "Tugas 1",
      instructions: "Tulis 500 kata.",
      due_date: "2026-12-30",
    });
    expect(task.error).toBeNull();

    const aTasks = await writerA.client.from("mentor_tasks").select("id").eq("id", taskId);
    expect(aTasks.data?.map((r) => r.id)).toEqual([taskId]);

    const bTasks = await writerB.client.from("mentor_tasks").select("id").eq("id", taskId);
    expect(bTasks.data).toEqual([]);

    const handInId = randomUUID();
    const handIn = await writerA.client.from("class_assignments").insert({
      id: handInId,
      slug: classSlug,
      assignment_id: taskId,
      source: "teks",
      status: "dikumpulkan",
    });
    expect(handIn.error).toBeNull();

    const mentorGrade = await mentor.client
      .from("class_assignments")
      .update({ status: "selesai" })
      .eq("id", handInId);
    expect(mentorGrade.error).toBeNull();

    const tId = randomUUID();
    await writerA.client.from("class_testimonials").insert({
      id: tId,
      slug: classSlug,
      display_name: "Penulis A",
      text: "Kelas sangat bermanfaat.",
      show_name: true,
    });
    expect(
      (await anonClient().from("class_testimonials").select("id").eq("id", tId)).data?.length,
    ).toBe(1);

    await organizer.client.from("testimonial_decisions").insert({
      testimonial_id: tId,
      slug: classSlug,
      state: "disembunyikan",
      reason: "Uji sembunyikan",
    });
    expect((await anonClient().from("class_testimonials").select("id").eq("id", tId)).data).toEqual(
      [],
    );
  });

  it("isolates Solo progress to submission owner and project Organizer", async () => {
    const created = await organizer.client.from("solo_progress").insert({
      submission_id: soloSubmissionId,
      slug: soloSlug,
      log: [{ kind: "lanjut", stage: "penyuntingan", at: Date.now(), by: "organizer" }],
    });
    expect(created.error).toBeNull();

    expect(
      (
        await writerA.client
          .from("solo_progress")
          .select("slug")
          .eq("submission_id", soloSubmissionId)
      ).data?.length,
    ).toBe(1);
    expect(
      (
        await writerB.client
          .from("solo_progress")
          .select("slug")
          .eq("submission_id", soloSubmissionId)
      ).data,
    ).toEqual([]);
  });

  it("enforces Storage policies for project-posters and project-files", async () => {
    const writerPoster = await writerA.client.storage
      .from("project-posters")
      .upload(`${writerA.id}/illegal.png`, PNG, { contentType: "image/png" });
    expect(writerPoster.error).not.toBeNull();

    const orgPoster = await organizer.client.storage
      .from("project-posters")
      .upload(`${organizer.id}/poster.png`, PNG, { contentType: "image/png" });
    expect(orgPoster.error).toBeNull();

    const ownFile = await writerA.client.storage
      .from("project-files")
      .upload(`${writerA.id}/manuscript.png`, PNG, { contentType: "image/png" });
    expect(ownFile.error).toBeNull();

    const bDownload = await writerB.client.storage
      .from("project-files")
      .download(`${writerA.id}/manuscript.png`);
    expect(bDownload.error).not.toBeNull();

    const edDownload = await editor.client.storage
      .from("project-files")
      .download(`${writerA.id}/manuscript.png`);
    expect(edDownload.error).toBeNull();
  });
});
