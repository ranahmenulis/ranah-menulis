import type { accountSession } from "@/features/studio/storage/store";
import type { WritingGroup } from "../../groups/group-model";
import { isUuid } from "./row-mapping";

type AccountSession = NonNullable<Awaited<ReturnType<typeof accountSession>>>;

export async function syncGroupRow(
  session: AccountSession,
  g: WritingGroup,
  old: WritingGroup | undefined,
  uid: string,
) {
  if (!old) {
    await session.client.from("writing_groups").insert({
      id: g.id,
      name: g.name,
      description: g.description,
      visibility: g.visibility,
      code: g.code,
      kind: g.kind ?? null,
      starts_on: g.startsOn ?? null,
      ends_on: g.endsOn ?? null,
      final_board: g.finalBoard ?? null,
      created_by: uid,
    });
    return;
  }
  const changed =
    old.name !== g.name ||
    old.description !== g.description ||
    old.visibility !== g.visibility ||
    old.code !== g.code ||
    old.finalBoard !== g.finalBoard;
  if (!changed) return;
  await session.client
    .from("writing_groups")
    .update({
      name: g.name,
      description: g.description,
      visibility: g.visibility,
      code: g.code,
      final_board: g.finalBoard ?? null,
    })
    .eq("id", g.id);
}

export async function syncGroupMembers(
  session: AccountSession,
  g: WritingGroup,
  old: WritingGroup | undefined,
  resolveUser: (id: string) => string,
) {
  const oldMembers = new Map((old?.members ?? []).map((m) => [resolveUser(m.authorId), m]));
  const nextIds = new Set<string>();
  for (const m of g.members) {
    const memberUid = resolveUser(m.authorId);
    if (!isUuid(memberUid)) continue;
    nextIds.add(memberUid);
    const prevM = oldMembers.get(memberUid);
    if (!prevM) {
      await session.client.from("group_members").insert({
        group_id: g.id,
        user_id: memberUid,
        membership_id: m.membershipId,
        is_admin: m.admin,
        board: Boolean(m.board),
        board_since: m.boardSince ?? null,
      });
    } else if (
      prevM.admin !== m.admin ||
      Boolean(prevM.board) !== Boolean(m.board) ||
      prevM.boardSince !== m.boardSince
    ) {
      await session.client
        .from("group_members")
        .update({
          is_admin: m.admin,
          board: Boolean(m.board),
          board_since: m.boardSince ?? null,
        })
        .eq("group_id", g.id)
        .eq("user_id", memberUid);
    }
  }
  for (const oldUid of oldMembers.keys()) {
    if (!nextIds.has(oldUid) && isUuid(oldUid)) {
      await session.client
        .from("group_members")
        .delete()
        .eq("group_id", g.id)
        .eq("user_id", oldUid);
    }
  }
}
