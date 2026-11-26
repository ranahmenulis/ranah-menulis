import { accountSession } from "@/features/studio/storage/store";
import type { RemoteListSync } from "@/lib/local-list-store";
import type { EditorPick } from "../../curation/picks-store";
import type { WritingGroup } from "../../groups/group-model";
import type { ModerationEntry, Report } from "../../moderation/report-store";
import { isUuid } from "./row-mapping";

export const picksRemoteSync: RemoteListSync<EditorPick> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("editor_picks")
      .select("post_id,title,picked_at")
      .order("picked_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      postId: r.post_id as string,
      at: Date.parse(r.picked_at as string),
      ...(r.title ? { title: r.title as string } : {}),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const prevIds = new Set(prev.map((p) => p.postId));
    const nextIds = new Set(next.map((p) => p.postId));
    const added = next.filter((p) => !prevIds.has(p.postId) && isUuid(p.postId));
    const removed = prev.filter((p) => !nextIds.has(p.postId) && isUuid(p.postId));
    if (added.length > 0) {
      await session.client.from("editor_picks").upsert(
        added.map((p) => ({
          post_id: p.postId,
          title: p.title ?? null,
          picked_by: session.userId,
        })),
        { onConflict: "post_id" },
      );
    }
    for (const r of removed) {
      await session.client.from("editor_picks").delete().eq("post_id", r.postId);
    }
  },
};

export const reportsRemoteSync: RemoteListSync<Report> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("community_reports")
      .select("kind,target_id,reporter_id,reason,created_at")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      kind: r.kind as Report["kind"],
      targetId: r.target_id as string,
      reporterId: r.reporter_id === session.userId ? "me" : (r.reporter_id as string),
      reason: r.reason as Report["reason"],
      at: Date.parse(r.created_at as string),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const added = next.slice(prev.length);
    for (const r of added) {
      if (!isUuid(r.targetId)) continue;
      await session.client.from("community_reports").insert({
        kind: r.kind,
        target_id: r.targetId,
        reporter_id: session.userId,
        reason: r.reason,
      });
    }
  },
};

export const moderationRemoteSync: RemoteListSync<ModerationEntry> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("moderation_decisions")
      .select("kind,target_id,decision,decided_by,reason,created_at")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      kind: r.kind as ModerationEntry["kind"],
      targetId: r.target_id as string,
      decision: r.decision as ModerationEntry["decision"],
      by: r.decided_by as string,
      at: Date.parse(r.created_at as string),
      ...(r.reason ? { reason: r.reason as string } : {}),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const added = next.slice(prev.length);
    for (const e of added) {
      if (!isUuid(e.targetId)) continue;
      await session.client.from("moderation_decisions").insert({
        kind: e.kind,
        target_id: e.targetId,
        decision: e.decision,
        decided_by: session.userId,
        reason: e.reason ?? null,
      });
    }
  },
};

function groupMap<T, R>(
  rows: readonly T[] | null | undefined,
  keyOf: (row: T) => string,
  mapRow: (row: T) => R,
): Map<string, R[]> {
  const out = new Map<string, R[]>();
  for (const row of rows ?? []) {
    const k = keyOf(row);
    const list = out.get(k) ?? [];
    list.push(mapRow(row));
    out.set(k, list);
  }
  return out;
}

export const groupsRemoteSync: RemoteListSync<WritingGroup> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const uid = session.userId;
    const asAuthor = (id: string) => (id === uid ? "me" : id);
    const [groupsRes, membersRes, invitesRes, reqRes, wordsRes, hiddenRes] = await Promise.all([
      session.client.from("writing_groups").select("*").order("created_at", { ascending: true }),
      session.client.from("group_members").select("*"),
      session.client.from("group_invites").select("*"),
      session.client.from("group_join_requests").select("*"),
      session.client.from("group_board_words").select("*"),
      session.client.from("group_hidden_posts").select("*"),
    ]);
    if (groupsRes.error || !groupsRes.data) return [];
    const membersByGroup = groupMap(
      membersRes.data,
      (m) => m.group_id as string,
      (m) => ({
        authorId: asAuthor(m.user_id as string),
        membershipId: m.membership_id as string,
        admin: Boolean(m.is_admin),
        ...(m.board ? { board: true } : {}),
        ...(m.board_since ? { boardSince: m.board_since as string } : {}),
      }),
    );
    const invitesByGroup = groupMap(
      invitesRes.data,
      (inv) => inv.group_id as string,
      (inv) => ({
        authorId: asAuthor(inv.user_id as string),
        by: asAuthor(inv.invited_by as string),
      }),
    );
    const reqByGroup = groupMap(
      reqRes.data,
      (rq) => rq.group_id as string,
      (rq) => ({
        authorId: asAuthor(rq.user_id as string),
        at: Date.parse(rq.created_at as string),
      }),
    );
    const wordsByGroup = groupMap(
      wordsRes.data,
      (w) => w.group_id as string,
      (w) => ({
        authorId: asAuthor(w.user_id as string),
        membershipId: w.membership_id as string,
        day: w.day as string,
        words: Number(w.words),
      }),
    );
    const hiddenByGroup = groupMap(
      hiddenRes.data,
      (h) => h.group_id as string,
      (h) => h.post_id as string,
    );

    return groupsRes.data.map((g) => ({
      id: g.id as string,
      name: g.name as string,
      description: (g.description as string) ?? "",
      visibility: g.visibility as WritingGroup["visibility"],
      code: g.code as string,
      ...(g.kind ? { kind: g.kind as WritingGroup["kind"] } : {}),
      ...(g.starts_on ? { startsOn: g.starts_on as string } : {}),
      ...(g.ends_on ? { endsOn: g.ends_on as string } : {}),
      ...(g.final_board ? { finalBoard: g.final_board as WritingGroup["finalBoard"] } : {}),
      members: membersByGroup.get(g.id as string) ?? [],
      invites: invitesByGroup.get(g.id as string) ?? [],
      requests: reqByGroup.get(g.id as string) ?? [],
      progress: [],
      hiddenPosts: hiddenByGroup.get(g.id as string) ?? [],
      words: wordsByGroup.get(g.id as string) ?? [],
    }));
  },
  async save(next) {
    const session = await accountSession();
    if (!session) return;
    const uid = session.userId;
    const resolveUser = (id: string) => (id === "me" ? uid : id);
    for (const g of next) {
      if (!isUuid(g.id)) continue;
      await session.client.from("writing_groups").upsert(
        {
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
        },
        { onConflict: "id" },
      );
      for (const m of g.members) {
        const memberUid = resolveUser(m.authorId);
        if (!isUuid(memberUid)) continue;
        await session.client.from("group_members").upsert(
          {
            group_id: g.id,
            user_id: memberUid,
            membership_id: m.membershipId,
            is_admin: m.admin,
            board: Boolean(m.board),
            board_since: m.boardSince ?? null,
          },
          { onConflict: "group_id,user_id" },
        );
      }
      for (const w of g.words ?? []) {
        const wUid = resolveUser(w.authorId);
        if (wUid !== uid) continue;
        await session.client.from("group_board_words").upsert(
          {
            group_id: g.id,
            user_id: wUid,
            membership_id: w.membershipId,
            day: w.day,
            words: w.words,
          },
          { onConflict: "group_id,user_id,day" },
        );
      }
    }
  },
};
