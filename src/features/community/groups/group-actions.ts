import { appendAudit, type NewAuditEntry } from "@/features/kelola/audit/audit-log";
import { personById } from "@/features/kelola/admin/people";
import { suspensions } from "@/features/kelola/admin/role-store";
import { reasonMessage, validateReason } from "@/features/kelola/reason";
import { readEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { isPlatformAdmin } from "@/lib/roles";
import {
  canManageGroup,
  groupErrors,
  memberOf,
  type GroupInput,
  type WritingGroup,
} from "./group-model";
import { writingGroups } from "./group-store";
import { readGroupReader } from "./group-viewer";

export type GroupResult = { ok: boolean; message: string };
export const refuseGroup = (message: string): GroupResult => ({ ok: false, message });
const done = (message: string): GroupResult => ({ ok: true, message });
const blocked = () => refuseGroup("Kamu tidak punya akses untuk melakukan tindakan ini.");
const unavailable = () => refuseGroup("Grup ini tidak tersedia.");
const newCode = () => crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();

function groupActor() {
  return { authorId: readGroupReader(), platform: isPlatformAdmin(readEffectiveRoles()) };
}

export function saveGroupChange(
  groups: readonly WritingGroup[],
  group: WritingGroup,
  authorId: string,
  event?: Pick<NewAuditEntry, "action" | "targetId" | "reason" | "ref">,
) {
  if (event) {
    appendAudit([{ actorId: authorId, label: group.name, ref: `group:${group.id}`, ...event }]);
  }
  writingGroups.write(
    groups.some((item) => item.id === group.id)
      ? groups.map((item) => (item.id === group.id ? group : item))
      : [...groups, group],
  );
}

/** All group writes re-read the actor and the group before applying a synchronous change. */
export function changeGroup(
  id: string,
  action: (
    group: WritingGroup,
    groups: readonly WritingGroup[],
    actor: { authorId: string; platform: boolean },
  ) => GroupResult,
) {
  const { authorId, platform } = groupActor();
  if (!authorId) return blocked();
  const groups = writingGroups.read();
  const group = groups.find((item) => item.id === id);
  return group ? action(group, groups, { authorId, platform }) : unavailable();
}

export function saveGroup(
  input: GroupInput,
  {
    original,
    fromAdmin = false,
  }: {
    original?: GroupInput & { id: string };
    fromAdmin?: boolean;
  } = {},
): GroupResult & { id?: string } {
  const errors = groupErrors(input);
  const issue = errors.name ?? errors.description ?? errors.visibility;
  if (issue) return refuseGroup(issue);
  const fields = {
    name: input.name.trim(),
    description: input.description.trim(),
    visibility: input.visibility,
  };

  if (original) {
    return changeGroup(original.id, (group, groups, { authorId, platform }) => {
      if ((fromAdmin && !platform) || !canManageGroup(group, authorId, platform)) return blocked();
      if (
        group.name !== original.name ||
        group.description !== original.description ||
        group.visibility !== original.visibility
      ) {
        return refuseGroup(
          "Pengaturan grup sudah berubah. Buka ulang formulir untuk melihat perubahan terbaru.",
        );
      }
      saveGroupChange(groups, { ...group, ...fields }, authorId, { action: "group.update" });
      return { ...done("Perubahan grup disimpan."), id: group.id };
    });
  }

  const { authorId, platform } = groupActor();
  if (!authorId || (fromAdmin && !platform)) return blocked();
  const group: WritingGroup = {
    ...fields,
    id: crypto.randomUUID(),
    code: newCode(),
    members: [{ authorId, membershipId: crypto.randomUUID(), admin: true }],
    invites: [],
    progress: [],
    hiddenPosts: [],
  };
  saveGroupChange(writingGroups.read(), group, authorId, { action: "group.create" });
  return { ...done("Grup dibuat."), id: group.id };
}

type JoinMethod = { type: "public" } | { type: "code"; value: string } | { type: "invite" };
const invalidCode = "Kode undangan tidak berlaku. Minta kode terbaru dari Admin Grup.";

function permitsJoin(group: WritingGroup, authorId: string, method: JoinMethod) {
  if (method.type === "code") return group.code === method.value;
  if (method.type === "public") return group.visibility === "publik";
  return group.invites.some((invite) => invite.authorId === authorId);
}

export function joinGroup(id: string, method: JoinMethod): GroupResult {
  return changeGroup(id, (group, groups, { authorId }) => {
    if (!permitsJoin(group, authorId, method)) {
      return refuseGroup(
        method.type === "code" ? invalidCode : "Undangan atau grup tidak tersedia.",
      );
    }
    if (memberOf(group, authorId)) return done("Kamu sudah menjadi anggota.");
    const member = { authorId, membershipId: crypto.randomUUID(), admin: false };
    saveGroupChange(
      groups,
      {
        ...group,
        members: [...group.members, member],
        invites: group.invites.filter((invite) => invite.authorId !== authorId),
      },
      authorId,
      { action: "group.join", targetId: authorId },
    );
    return done("Kamu bergabung dengan grup.");
  });
}

export function joinByCode(raw: string): GroupResult & { id?: string } {
  if (!readGroupReader()) return blocked();
  const value = raw.trim().toUpperCase();
  const group = value && writingGroups.read().find((item) => item.code === value);
  if (!group) return refuseGroup(invalidCode);
  const result = joinGroup(group.id, { type: "code", value });
  return result.ok ? { ...result, id: group.id } : result;
}

export function declineInvite(id: string) {
  return changeGroup(id, (group, groups, { authorId }) => {
    if (!group.invites.some((invite) => invite.authorId === authorId)) return unavailable();
    saveGroupChange(
      groups,
      { ...group, invites: group.invites.filter((invite) => invite.authorId !== authorId) },
      authorId,
    );
    return done("Undangan ditolak.");
  });
}

export function inviteToGroup(id: string, targetId: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!canManageGroup(group, authorId, platform)) return blocked();
    if (!personById(targetId) || suspensions.read().some((item) => item.userId === targetId)) {
      return refuseGroup("Penulis ini tidak tersedia.");
    }
    if (memberOf(group, targetId) || group.invites.some((item) => item.authorId === targetId)) {
      return refuseGroup("Penulis ini sudah menjadi anggota atau sudah diundang.");
    }
    saveGroupChange(
      groups,
      { ...group, invites: [...group.invites, { authorId: targetId, by: authorId }] },
      authorId,
      { action: "group.invite", targetId },
    );
    return done("Undangan ditambahkan.");
  });
}

export function rotateGroupCode(id: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!canManageGroup(group, authorId, platform)) return blocked();
    saveGroupChange(groups, { ...group, code: newCode() }, authorId, { action: "group.code" });
    return done("Kode diganti. Kode lama tidak berlaku.");
  });
}

export function removeGroupMember(id: string, targetId: string, reason?: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    const member = memberOf(group, targetId);
    if (!member) return refuseGroup("Penulis ini sudah tidak menjadi anggota.");
    const leaving = authorId === targetId;
    if (!leaving && (!canManageGroup(group, authorId, platform) || (member.admin && !platform))) {
      return blocked();
    }
    const issue = leaving ? null : validateReason(reason ?? "", true);
    if (issue) return refuseGroup(reasonMessage[issue]);
    saveGroupChange(
      groups,
      {
        ...group,
        members: group.members.filter((item) => item.authorId !== targetId),
        progress: group.progress.filter((item) => item.authorId !== targetId),
      },
      authorId,
      { action: leaving ? "group.leave" : "group.remove", targetId, reason: reason?.trim() },
    );
    return done(leaving ? "Kamu keluar dari grup." : "Anggota dikeluarkan.");
  });
}

export function setGroupAdmin(id: string, targetId: string, admin: boolean, reason?: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!platform) return blocked();
    const member = memberOf(group, targetId);
    if (!member || member.admin === admin)
      return refuseGroup("Keanggotaan atau peran sudah berubah.");
    // [usulan Q-48] Only platform admins appoint or revoke a group admin.
    const issue = admin ? null : validateReason(reason ?? "", true);
    if (issue) return refuseGroup(reasonMessage[issue]);
    saveGroupChange(
      groups,
      {
        ...group,
        members: group.members.map((item) => (item === member ? { ...item, admin } : item)),
      },
      authorId,
      {
        action: admin ? "group.admin.grant" : "group.admin.revoke",
        targetId,
        reason: reason?.trim(),
      },
    );
    return done(admin ? "Admin Grup ditunjuk." : "Peran Admin Grup dicabut.");
  });
}
