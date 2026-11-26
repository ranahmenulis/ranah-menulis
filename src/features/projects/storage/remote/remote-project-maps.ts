import { accountSession } from "@/features/studio/storage/store";
import type { Marks } from "../../kelas/material-progress";
import type { MentorTask } from "../../kelas/mentor-tasks";
import type { ContestOverrides } from "../../lomba/types";
import type { Registration, RegistrationMap } from "../../types";

export async function loadRemoteRegistrations(): Promise<RegistrationMap | null> {
  const session = await accountSession();
  if (!session) return null;
  const { data, error } = await session.client
    .from("project_registrations")
    .select("slug,status,package_name,terms_version,agreed_at,registered_at,paid_at,paid_by")
    .eq("user_id", session.userId);
  if (error || !data) return {};
  const map: RegistrationMap = {};
  for (const r of data) {
    const slug = r.slug as string;
    map[slug] = {
      slug,
      status: r.status as Registration["status"],
      termsVersion: r.terms_version as string,
      agreedAt: Date.parse(r.agreed_at as string),
      registeredAt: Date.parse(r.registered_at as string),
      ...(r.package_name ? { packageName: r.package_name as string } : {}),
      ...(r.paid_at ? { paidAt: Date.parse(r.paid_at as string) } : {}),
      ...(r.paid_by ? { paidBy: r.paid_by as Registration["paidBy"] } : {}),
    };
  }
  return map;
}

export async function saveRemoteRegistration(r: Registration): Promise<void> {
  const session = await accountSession();
  if (!session) return;
  await session.client.from("project_registrations").upsert(
    {
      slug: r.slug,
      user_id: session.userId,
      status: r.status,
      package_name: r.packageName ?? null,
      terms_version: r.termsVersion,
      agreed_at: new Date(r.agreedAt).toISOString(),
      registered_at: new Date(r.registeredAt).toISOString(),
      paid_at: r.paidAt ? new Date(r.paidAt).toISOString() : null,
      paid_by: r.paidBy ?? null,
    },
    { onConflict: "slug,user_id" },
  );
}

export async function deleteRemoteRegistration(slug: string): Promise<void> {
  const session = await accountSession();
  if (!session) return;
  await session.client
    .from("project_registrations")
    .delete()
    .eq("slug", slug)
    .eq("user_id", session.userId);
}

export async function loadRemoteMaterialMarks(): Promise<Marks | null> {
  const session = await accountSession();
  if (!session) return null;
  const { data, error } = await session.client
    .from("class_material_progress")
    .select("slug,material_id")
    .eq("user_id", session.userId);
  if (error || !data) return {};
  const marks: Marks = {};
  for (const row of data) {
    const slug = row.slug as string;
    const list = marks[slug] ?? [];
    list.push(row.material_id as string);
    marks[slug] = list;
  }
  return marks;
}

export async function saveRemoteMaterialMark(
  slug: string,
  materialId: string,
  done: boolean,
): Promise<void> {
  const session = await accountSession();
  if (!session) return;
  if (done) {
    await session.client
      .from("class_material_progress")
      .upsert(
        { slug, user_id: session.userId, material_id: materialId },
        { onConflict: "slug,user_id,material_id" },
      );
  } else {
    await session.client
      .from("class_material_progress")
      .delete()
      .eq("slug", slug)
      .eq("user_id", session.userId)
      .eq("material_id", materialId);
  }
}

export async function loadRemoteMentorTasks(): Promise<readonly MentorTask[] | null> {
  const session = await accountSession();
  if (!session) return null;
  const { data, error } = await session.client
    .from("mentor_tasks")
    .select("id,slug,title,instructions,due_date,created_at")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    instructions: r.instructions as string,
    dueDate: r.due_date as string,
    createdAt: Date.parse(r.created_at as string),
  }));
}

export async function upsertRemoteMentorTask(task: MentorTask): Promise<void> {
  const session = await accountSession();
  if (!session) return;
  await session.client.from("mentor_tasks").upsert(
    {
      id: task.id,
      slug: task.slug,
      title: task.title,
      instructions: task.instructions,
      due_date: task.dueDate,
      created_by: session.userId,
      created_at: new Date(task.createdAt).toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function deleteRemoteMentorTask(id: string): Promise<void> {
  const session = await accountSession();
  if (!session) return;
  await session.client.from("mentor_tasks").delete().eq("id", id);
}

export async function loadRemoteContestStages(): Promise<ContestOverrides | null> {
  const session = await accountSession();
  if (!session) return null;
  const { data, error } = await session.client.from("contest_stages").select("slug,stage,times");
  if (error || !data) return {};
  const out: ContestOverrides = {};
  for (const r of data) {
    out[r.slug as string] = {
      stage: r.stage as ContestOverrides[string]["stage"],
      times: (r.times as ContestOverrides[string]["times"]) ?? {},
      mine: false,
    };
  }
  return out;
}

export async function saveRemoteContestStage(
  slug: string,
  override: ContestOverrides[string],
): Promise<void> {
  const session = await accountSession();
  if (!session) return;
  await session.client.from("contest_stages").upsert(
    {
      slug,
      stage: override.stage,
      times: override.times,
      updated_by: session.userId,
    },
    { onConflict: "slug" },
  );
}
