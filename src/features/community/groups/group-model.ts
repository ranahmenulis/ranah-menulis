export const GROUPS_HREF = "/grup";
export const ADMIN_GROUPS_HREF = "/kelola/admin/grup";
export const groupHref = (id: string) => `${GROUPS_HREF}/${encodeURIComponent(id)}`;
export const adminGroupHref = (id: string) => `${ADMIN_GROUPS_HREF}/${encodeURIComponent(id)}`;

export const COASTAL_GROUP_ID = "penulis-pesisir";
export const COASTAL_GROUP_NAME = "Grup Penulis Pesisir";
export const initialMembership = (authorId: string) => `pesisir:${authorId}`;

export type GroupVisibility = "publik" | "privat";
export type GroupInput = {
  name: string;
  description: string;
  visibility: GroupVisibility;
  /** Chosen when a circle is created and never changed after. */
  kind?: CircleKind;
  /** A challenge only: the first day, as yyyy-mm-dd. */
  startsOn?: string;
};
export type GroupMember = {
  authorId: string;
  membershipId: string;
  admin: boolean;
  /** Opt-in to the leaderboard (client, 23 November 2026). Off unless the member turned it on. */
  board?: boolean;
  /** The day (yyyy-mm-dd) words start to count for this member. */
  boardSince?: string;
};
/** A circle is open-ended, or a 45-day challenge with a start and an end day. */
export type CircleKind = "permanent" | "challenge";
/** Words one member wrote on one day, for the leaderboard. Never the text. */
export type CircleWords = { authorId: string; membershipId: string; day: string; words: number };
/** A request to join a private circle through its link; the Circle Admin accepts or declines. */
export type JoinRequest = { authorId: string; at: number };
/** One line of the frozen result of a finished challenge. `authorId` is null once the person left. */
export type FinalRow = { authorId: string | null; name: string; words: number; rank: number };
export type GroupInvite = { authorId: string; by: string };
export type GroupProgress = {
  id: string;
  authorId: string;
  membershipId: string;
  username: string;
  title: string;
  words: number;
};
export type WritingGroup = GroupInput & {
  id: string;
  code: string;
  members: GroupMember[];
  invites: GroupInvite[];
  progress: GroupProgress[];
  hiddenPosts: string[];
  /** All of these are optional so circles stored before them keep working (they are permanent). */
  kind?: CircleKind;
  startsOn?: string;
  endsOn?: string;
  requests?: JoinRequest[];
  words?: CircleWords[];
  finalBoard?: FinalRow[];
};

// [usulan] Form limits for the slice. No membership or group-count quota (Q-57).
export const GROUP_NAME_LIMIT = 40;
export const GROUP_DESCRIPTION_LIMIT = 240;

export type GroupFieldError =
  "nameRequired" | "nameTooLong" | "descriptionTooLong" | "visibilityRequired";

/** Codes (not sentences) of what is wrong with a form; `groupMessage` turns them into text. */
export function groupErrors(input: GroupInput): {
  name?: GroupFieldError;
  description?: GroupFieldError;
  visibility?: GroupFieldError;
} {
  const name = input.name.trim();
  return {
    name: !name ? "nameRequired" : name.length > GROUP_NAME_LIMIT ? "nameTooLong" : undefined,
    description:
      input.description.trim().length > GROUP_DESCRIPTION_LIMIT ? "descriptionTooLong" : undefined,
    visibility:
      input.visibility !== "publik" && input.visibility !== "privat"
        ? "visibilityRequired"
        : undefined,
  };
}

export function memberOf(group: WritingGroup, authorId: string | null) {
  return group.members.find((member) => member.authorId === authorId);
}

export function groupsFor(groups: readonly WritingGroup[], authorId: string | null) {
  return groups.filter((group) => memberOf(group, authorId));
}

export function canManageGroup(
  group: WritingGroup,
  authorId: string | null,
  platformAdmin: boolean,
) {
  return platformAdmin || memberOf(group, authorId)?.admin === true;
}

type GroupPost = {
  id: string;
  authorId: string;
  visibility: GroupVisibility | "grup";
  groupId?: string;
  groupName?: string;
  groupMembershipId?: string;
};

/** [usulan Q-38] The known legacy audience maps by name; new posts carry a stable group id. */
export function groupIdOf(post: Pick<GroupPost, "groupId" | "groupName">) {
  return post.groupId ?? (post.groupName === COASTAL_GROUP_NAME ? COASTAL_GROUP_ID : undefined);
}

export function postMembershipId(post: GroupPost) {
  return post.groupId ? post.groupMembershipId : initialMembership(post.authorId);
}

export function activeGroupPost(post: GroupPost, group: WritingGroup) {
  if (post.visibility !== "grup" || groupIdOf(post) !== group.id) return false;
  const member = memberOf(group, post.authorId);
  return member !== undefined && member.membershipId === postMembershipId(post);
}

export function canReadGroupPost(
  post: GroupPost,
  groups: readonly WritingGroup[],
  readerId: string | null,
) {
  const group = groups.find((candidate) => candidate.id === groupIdOf(post));
  return Boolean(
    group &&
    memberOf(group, readerId) &&
    activeGroupPost(post, group) &&
    !group.hiddenPosts.includes(post.id),
  );
}
