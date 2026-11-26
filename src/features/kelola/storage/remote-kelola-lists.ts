import type { SupabaseClient } from "@supabase/supabase-js";
import { accountSession } from "@/features/studio/storage/store";
import { ME_ID } from "@/features/community/fixtures/authors";
import { isUuid } from "@/features/community/storage/remote/row-mapping";
import type { RemoteListSync } from "@/lib/local-list-store";
import type { ManagerRole } from "@/lib/roles";
import type { RoleGrant, Suspension } from "../admin/role-store";
import type { AuditAction, AuditEntry } from "../audit/audit-log";
import type { JudgingEntry, JuryScore } from "../juri/score-store";
import type { StaffAssignment, StaffRole } from "../staff-assignments";

export const staffAssignmentsRemoteSync: RemoteListSync<StaffAssignment> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("staff_assignments")
      .select("project_slug,role,staff_id");
    if (error || !data) return [];
    return data.map((r) => ({
      slug: r.project_slug as string,
      role: r.role as StaffRole,
      staffId: r.staff_id === session.userId ? ME_ID : (r.staff_id as string),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const resolve = (id: string) => (id === ME_ID ? session.userId : id);
    const keyOf = (a: StaffAssignment) => `${a.slug}:${a.role}:${resolve(a.staffId)}`;
    const prevSet = new Set(prev.map(keyOf));
    const nextSet = new Set(next.map(keyOf));
    for (const a of next) {
      const uid = resolve(a.staffId);
      if (!prevSet.has(keyOf(a)) && isUuid(uid)) {
        await session.client
          .from("staff_assignments")
          .upsert(
            { project_slug: a.slug, role: a.role, staff_id: uid, assigned_by: session.userId },
            { onConflict: "project_slug,role,staff_id" },
          );
      }
    }
    for (const a of prev) {
      const uid = resolve(a.staffId);
      if (!nextSet.has(keyOf(a)) && isUuid(uid)) {
        await session.client
          .from("staff_assignments")
          .delete()
          .eq("project_slug", a.slug)
          .eq("role", a.role)
          .eq("staff_id", uid);
      }
    }
  },
};

export const juryScoresRemoteSync: RemoteListSync<JuryScore> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("jury_scores")
      .select("submission_id,slug,judge_id,scores,note,scored_at");
    if (error || !data) return [];
    return data.map((r) => ({
      submissionId: r.submission_id as string,
      slug: r.slug as string,
      judgeId: r.judge_id === session.userId ? ME_ID : (r.judge_id as string),
      scores: (r.scores as Record<string, number>) ?? {},
      note: (r.note as string) ?? "",
      at: Date.parse(r.scored_at as string),
    }));
  },
  async save(next) {
    const session = await accountSession();
    if (!session) return;
    for (const s of next) {
      if (!isUuid(s.submissionId) || s.judgeId !== ME_ID) continue;
      await session.client.from("jury_scores").upsert(
        {
          submission_id: s.submissionId,
          slug: s.slug,
          judge_id: session.userId,
          scores: s.scores,
          note: s.note,
          scored_at: new Date(s.at).toISOString(),
        },
        { onConflict: "submission_id,judge_id" },
      );
    }
  },
};

export const judgingLogRemoteSync: RemoteListSync<JudgingEntry> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("judging_log")
      .select("slug,state,note,actor_id,created_at")
      .order("id", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      slug: r.slug as string,
      state: r.state as JudgingEntry["state"],
      at: Date.parse(r.created_at as string),
      ...(r.note ? { note: r.note as string } : {}),
      ...(r.actor_id ? { by: r.actor_id === session.userId ? ME_ID : (r.actor_id as string) } : {}),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    for (const e of next.slice(prev.length)) {
      await session.client.from("judging_log").insert({
        slug: e.slug,
        state: e.state,
        note: e.note ?? null,
        actor_id: session.userId,
      });
    }
  },
};

const PLATFORM_TO_APP: Record<string, ManagerRole> = {
  administrator: "administrator",
  super_admin: "super-admin",
};

async function applyRoleRpc(
  client: SupabaseClient,
  uid: string,
  grant: RoleGrant,
  mode: "grant" | "revoke",
): Promise<void> {
  if (grant.role === "administrator" || grant.role === "super-admin") {
    const fn = mode === "grant" ? "grant_platform_role" : "revoke_platform_role";
    const r = grant.role === "super-admin" ? "super_admin" : "administrator";
    await client.rpc(fn, { target: uid, r });
    return;
  }
  const fn = mode === "grant" ? "grant_staff_role" : "revoke_staff_role";
  await client.rpc(fn, {
    p_target: uid,
    p_role: grant.role,
    p_reason: grant.reason ?? (mode === "revoke" ? "Dicabut" : null),
  });
}

export const roleGrantsRemoteSync: RemoteListSync<RoleGrant> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const [staffRes, platRes] = await Promise.all([
      session.client.from("staff_roles").select("user_id,role,granted_by,reason,granted_at"),
      session.client.from("platform_roles").select("user_id,role,granted_by,granted_at"),
    ]);
    const asId = (id: string | null) => (!id ? "setup" : id === session.userId ? ME_ID : id);
    const staff: RoleGrant[] = (staffRes.data ?? []).map((r) => ({
      userId: asId(r.user_id as string),
      role: r.role as ManagerRole,
      grantedBy: asId(r.granted_by as string | null),
      at: Date.parse(r.granted_at as string),
      ...(r.reason ? { reason: r.reason as string } : {}),
    }));
    const plat: RoleGrant[] = (platRes.data ?? [])
      .filter((r) => Boolean(PLATFORM_TO_APP[r.role as string]))
      .map((r) => ({
        userId: asId(r.user_id as string),
        role: PLATFORM_TO_APP[r.role as string],
        grantedBy: asId(r.granted_by as string | null),
        at: Date.parse(r.granted_at as string),
      }));
    return [...plat, ...staff];
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const resolve = (id: string) => (id === ME_ID ? session.userId : id);
    const keyOf = (g: RoleGrant) => `${resolve(g.userId)}:${g.role}`;
    const prevSet = new Set(prev.map(keyOf));
    const nextSet = new Set(next.map(keyOf));
    for (const g of next) {
      const uid = resolve(g.userId);
      if (!prevSet.has(keyOf(g)) && isUuid(uid))
        await applyRoleRpc(session.client, uid, g, "grant");
    }
    for (const g of prev) {
      const uid = resolve(g.userId);
      if (!nextSet.has(keyOf(g)) && isUuid(uid))
        await applyRoleRpc(session.client, uid, g, "revoke");
    }
  },
};

export const suspensionsRemoteSync: RemoteListSync<Suspension> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("account_suspensions")
      .select("user_id,suspended_by,reason,suspended_at");
    if (error || !data) return [];
    const asId = (id: string | null) => (!id ? "setup" : id === session.userId ? ME_ID : id);
    return data.map((r) => ({
      userId: asId(r.user_id as string),
      by: asId(r.suspended_by as string | null),
      at: Date.parse(r.suspended_at as string),
      reason: r.reason as string,
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const resolve = (id: string) => (id === ME_ID ? session.userId : id);
    const prevSet = new Set(prev.map((s) => resolve(s.userId)));
    const nextSet = new Set(next.map((s) => resolve(s.userId)));
    for (const s of next) {
      const uid = resolve(s.userId);
      if (!prevSet.has(uid) && isUuid(uid)) {
        await session.client.rpc("suspend_account", { p_target: uid, p_reason: s.reason });
      }
    }
    for (const s of prev) {
      const uid = resolve(s.userId);
      if (!nextSet.has(uid) && isUuid(uid)) {
        await session.client.rpc("restore_account", { p_target: uid });
      }
    }
  },
};

export const auditLogRemoteSync: RemoteListSync<AuditEntry> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("audit_log")
      .select("id,actor_id,action,target_id,detail,created_at")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error || !data) return [];
    return data.map((r) => {
      const d = (r.detail as Record<string, unknown>) ?? {};
      return {
        id: String(r.id),
        at: Date.parse(r.created_at as string),
        actorId: (r.actor_id as string) ?? "setup",
        action: r.action as AuditAction,
        ...(r.target_id ? { targetId: r.target_id as string } : {}),
        ...(typeof d.ref === "string" ? { ref: d.ref } : {}),
        ...(typeof d.label === "string" ? { label: d.label } : {}),
        ...(typeof d.role === "string" ? { role: d.role } : {}),
        ...(typeof d.slug === "string" ? { slug: d.slug } : {}),
        ...(typeof d.reason === "string" ? { reason: d.reason } : {}),
      };
    });
  },
  async save() {
    // Audit log is server/RPC-written only; clients cannot insert directly under RLS.
  },
};
