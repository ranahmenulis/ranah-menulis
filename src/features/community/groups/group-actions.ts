import { appendAudit, type NewAuditEntry } from "@/features/kelola/audit/audit-log";
import { personById } from "@/features/kelola/admin/people";
import { suspensions } from "@/features/kelola/admin/role-store";
import { validateReason } from "@/features/kelola/reason";
import { readEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { isPlatformAdmin } from "@/lib/roles";
import { challengeEnd, validateCircleStart } from "./board-model";
import {
  canManageGroup,
  groupErrors,
  memberOf,
  type GroupInput,
  type WritingGroup,
} from "./group-model";
import { groupMessage, type GroupCode } from "./group-messages";
import { writingGroups } from "./group-store";
import { readGroupReader } from "./group-viewer";

/** `code` is what screens translate; `message` is the Indonesian default for the same code. */
export type GroupResult = { ok: boolean; message: string; code: GroupCode };
export const refuseGroup = (code: GroupCode): GroupResult => ({
  ok: false,
  code,
  message: groupMessage(code),
});
export const doneGroup = (code: GroupCode): GroupResult => ({
  ok: true,
  code,
  message: groupMessage(code),
});
const done = doneGroup;
const blocked = () => refuseGroup("blocked");
const unavailable = () => refuseGroup("unavailable");
const reasonCode = (issue: "kosong" | "terlalu-panjang"): GroupCode =>
  issue === "kosong" ? "reasonEmpty" : "reasonTooLong";
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

/** Kind and dates are fixed when a circle is made: a challenge needs a real start day. */
function circleKindFields(input: GroupInput, today: string) {
  const kind = input.kind ?? "permanent";
  const problem = validateCircleStart(kind, input.startsOn ?? "", today);
  const startsOn = input.startsOn;
  const extra: Partial<WritingGroup> =
    kind === "challenge" && startsOn ? { kind, startsOn, endsOn: challengeEnd(startsOn) } : {};
  return { problem, extra };
}

export function saveGroup(
  input: GroupInput,
  {
    original,
    fromAdmin = false,
    today = new Date().toISOString().slice(0, 10),
  }: {
    original?: GroupInput & { id: string };
    fromAdmin?: boolean;
    /** The writer's day (yyyy-mm-dd), for the start day of a challenge. */
    today?: string;
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
        return refuseGroup("groupChanged");
      }
      saveGroupChange(groups, { ...group, ...fields }, authorId, { action: "group.update" });
      return { ...done("saved"), id: group.id };
    });
  }

  const { authorId, platform } = groupActor();
  if (!authorId || (fromAdmin && !platform)) return blocked();
  const circle = circleKindFields(input, today);
  if (circle.problem) return refuseGroup(circle.problem);
  const group: WritingGroup = {
    ...fields,
    id: crypto.randomUUID(),
    code: newCode(),
    members: [{ authorId, membershipId: crypto.randomUUID(), admin: true }],
    invites: [],
    progress: [],
    hiddenPosts: [],
    ...circle.extra,
  };
  saveGroupChange(writingGroups.read(), group, authorId, { action: "group.create" });
  return { ...done("created"), id: group.id };
}

type JoinMethod = { type: "public" } | { type: "code"; value: string } | { type: "invite" };

function permitsJoin(group: WritingGroup, authorId: string, method: JoinMethod) {
  if (method.type === "code") return group.code === method.value;
  if (method.type === "public") return group.visibility === "publik";
  return group.invites.some((invite) => invite.authorId === authorId);
}

export function joinGroup(id: string, method: JoinMethod): GroupResult {
  return changeGroup(id, (group, groups, { authorId }) => {
    if (!permitsJoin(group, authorId, method)) {
      return refuseGroup(method.type === "code" ? "invalidCode" : "inviteUnavailable");
    }
    if (memberOf(group, authorId)) return done("alreadyMember");
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
    return done("joined");
  });
}

export function joinByCode(raw: string): GroupResult & { id?: string } {
  if (!readGroupReader()) return blocked();
  const value = raw.trim().toUpperCase();
  const group = value && writingGroups.read().find((item) => item.code === value);
  if (!group) return refuseGroup("invalidCode");
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
    return done("inviteDeclined");
  });
}

export function inviteToGroup(id: string, targetId: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!canManageGroup(group, authorId, platform)) return blocked();
    if (!personById(targetId) || suspensions.read().some((item) => item.userId === targetId)) {
      return refuseGroup("authorUnavailable");
    }
    if (memberOf(group, targetId) || group.invites.some((item) => item.authorId === targetId)) {
      return refuseGroup("alreadyInvited");
    }
    saveGroupChange(
      groups,
      { ...group, invites: [...group.invites, { authorId: targetId, by: authorId }] },
      authorId,
      { action: "group.invite", targetId },
    );
    return done("inviteAdded");
  });
}

export function rotateGroupCode(id: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!canManageGroup(group, authorId, platform)) return blocked();
    saveGroupChange(groups, { ...group, code: newCode() }, authorId, { action: "group.code" });
    return done("codeRotated");
  });
}

export function removeGroupMember(id: string, targetId: string, reason?: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    const member = memberOf(group, targetId);
    if (!member) return refuseGroup("notMemberAnymore");
    const leaving = authorId === targetId;
    if (!leaving && (!canManageGroup(group, authorId, platform) || (member.admin && !platform))) {
      return blocked();
    }
    const issue = leaving ? null : validateReason(reason ?? "", true);
    if (issue) return refuseGroup(reasonCode(issue));
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
    return done(leaving ? "left" : "removed");
  });
}

export function setGroupAdmin(id: string, targetId: string, admin: boolean, reason?: string) {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!platform) return blocked();
    const member = memberOf(group, targetId);
    if (!member || member.admin === admin) return refuseGroup("roleChanged");
    // [usulan Q-48] Only platform admins appoint or revoke a group admin.
    const issue = admin ? null : validateReason(reason ?? "", true);
    if (issue) return refuseGroup(reasonCode(issue));
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
    return done(admin ? "adminGranted" : "adminRevoked");
  });
}
