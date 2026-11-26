import type { SupabaseClient } from "@supabase/supabase-js";
import { registerAuthors } from "../../post-model";
import type { Marks, PostStore, StoredPost } from "../post-store";
import {
  authorFromProfile,
  commentFromRow,
  isUuid,
  marksFromRows,
  postFromRow,
  postToRow,
  type CommentRow,
  type PostCountsRow,
  type PostRow,
  type ProfileSummaryRow,
} from "./row-mapping";

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message, { cause: res.error });
  return res.data;
}

async function syncAuthors(client: SupabaseClient, ids: readonly string[]): Promise<void> {
  const unique = [...new Set(ids.filter(isUuid))];
  if (unique.length === 0) return;
  const { data } = await client
    .from("profiles")
    .select("id,display_name,username,country")
    .in("id", unique);
  if (data) registerAuthors((data as ProfileSummaryRow[]).map(authorFromProfile));
}

export function createSupabasePostStore(
  client: SupabaseClient,
  getUserId: () => Promise<string | null>,
): PostStore {
  async function requireUser(): Promise<string> {
    const id = await getUserId();
    if (!id) throw new Error("Not signed in");
    return id;
  }

  return {
    async listPosts() {
      const uid = (await getUserId()) ?? "";
      const rows = check(
        await client
          .from("community_posts")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(200),
      ) as PostRow[];
      await syncAuthors(
        client,
        rows.map((r) => r.author_id),
      );
      const ids = rows.map((r) => r.id);
      const countsMap = new Map<string, { appreciations: number; saves: number }>();
      if (ids.length > 0) {
        const counts = check(
          await client.rpc("community_post_counts", { p_post_ids: ids }),
        ) as PostCountsRow[];
        for (const c of counts) {
          countsMap.set(c.post_id, { appreciations: c.appreciations, saves: c.saves });
        }
      }
      return rows.map((row) => postFromRow(row, uid, countsMap.get(row.id)));
    },

    async getPost(id) {
      if (!isUuid(id)) return null;
      const uid = (await getUserId()) ?? "";
      const row = check(
        await client.from("community_posts").select("*").eq("id", id).maybeSingle(),
      ) as PostRow | null;
      if (!row) return null;
      await syncAuthors(client, [row.author_id]);
      return postFromRow(row, uid);
    },

    async putPost(post: StoredPost) {
      const uid = await requireUser();
      check(
        await client.from("community_posts").upsert(postToRow(post, uid), { onConflict: "id" }),
      );
    },

    async deletePost(id) {
      if (!isUuid(id)) return;
      await requireUser();
      check(await client.from("community_posts").delete().eq("id", id));
    },

    async listComments() {
      const uid = (await getUserId()) ?? "";
      const rows = check(
        await client
          .from("community_comments")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(500),
      ) as CommentRow[];
      await syncAuthors(
        client,
        rows.map((r) => r.author_id),
      );
      return rows.map((row) => commentFromRow(row, uid));
    },

    async putComment(comment) {
      const uid = await requireUser();
      check(
        await client.from("community_comments").upsert(
          {
            id: comment.id,
            post_id: comment.postId,
            author_id: uid,
            parent_id: comment.parentId,
            text: comment.text,
            mention: comment.mention ?? null,
            created_at: new Date(comment.createdAt).toISOString(),
          },
          { onConflict: "id" },
        ),
      );
    },

    async listMarks(): Promise<Marks> {
      const uid = await getUserId();
      if (!uid) return {};
      const rows = check(await client.from("community_marks").select("key").eq("user_id", uid)) as {
        key: string;
      }[];
      return marksFromRows(rows);
    },

    async setMark(key, value) {
      const uid = await requireUser();
      if (value) {
        check(
          await client
            .from("community_marks")
            .upsert({ user_id: uid, key }, { onConflict: "user_id,key" }),
        );
      } else {
        check(await client.from("community_marks").delete().eq("user_id", uid).eq("key", key));
      }
    },
  };
}
