import { canManageGroup, memberOf } from "./group-model";
import {
  changeGroup,
  doneGroup,
  refuseGroup,
  saveGroupChange,
  type GroupResult,
} from "./group-actions";

/**
 * The Circle Admin (or a platform admin) answers a request to join a private circle. The circle and
 * the request are read again when the button is pressed; a request that is gone, or a person who is
 * already a member, is refused. Accepting adds a fresh membership; either answer is audited.
 */
export function answerJoinRequest(id: string, targetId: string, accept: boolean): GroupResult {
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!canManageGroup(group, authorId, platform)) return refuseGroup("blocked");
    const requests = group.requests ?? [];
    if (!requests.some((request) => request.authorId === targetId)) {
      return refuseGroup("requestGone");
    }
    const rest = requests.filter((request) => request.authorId !== targetId);
    const joining = accept && !memberOf(group, targetId);
    saveGroupChange(
      groups,
      {
        ...group,
        requests: rest,
        members: joining
          ? [
              ...group.members,
              { authorId: targetId, membershipId: crypto.randomUUID(), admin: false },
            ]
          : group.members,
        invites: group.invites.filter((invite) => invite.authorId !== targetId),
      },
      authorId,
      { action: accept ? "group.request.accept" : "group.request.decline", targetId },
    );
    return doneGroup(accept ? "requestAccepted" : "requestDeclined");
  });
}
