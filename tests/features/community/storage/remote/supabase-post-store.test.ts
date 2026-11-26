import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { authorOf } from "@/features/community/post-model";
import { createSupabasePostStore } from "@/features/community/storage/remote/supabase-post-store";
import { postFromRow, postToRow } from "@/features/community/storage/remote/row-mapping";

describe("community row mapping", () => {
  it("maps own and other authors' posts with aggregate counts", () => {
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      author_id: "user-1",
      status: "published" as const,
      title: "Senja",
      kind: "prolog" as const,
      genre: "Cerpen" as const,
      blocks: [{ type: "paragraph" as const, text: "Isi" }],
      source_title: null,
      source_doc_id: null,
      visibility: "publik" as const,
      group_id: null,
      group_membership_id: null,
      image: null,
      created_at: "2026-11-26T00:00:00.000Z",
      updated_at: "2026-11-26T01:00:00.000Z",
      published_at: "2026-11-26T01:00:00.000Z",
    };

    const mine = postFromRow(row, "user-1", { appreciations: 3, saves: 2 });
    expect(mine.authorId).toBe("me");
    expect(mine.appreciations).toBe(3);
    expect(mine.saves).toBe(2);

    const theirs = postFromRow(row, "user-2");
    expect(theirs.authorId).toBe("user-1");

    const serialized = postToRow(mine, "user-1");
    expect(serialized.author_id).toBe("user-1");
    expect(serialized.source_doc_id).toBeNull();
  });
});

describe("createSupabasePostStore", () => {
  it("lists posts, resolves real author profiles, and toggles marks", async () => {
    const uid = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const otherId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const postId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const upsert = vi.fn(async () => ({ error: null }));
    const delEq2 = vi.fn(async () => ({ error: null }));
    const delEq1 = vi.fn(() => ({ eq: delEq2 }));

    const client = {
      from: (table: string) => {
        if (table === "community_posts") {
          return {
            select: () => ({
              order: () => ({
                limit: async () => ({
                  data: [
                    {
                      id: postId,
                      author_id: otherId,
                      status: "published",
                      title: "Tulisan Lain",
                      kind: "cuplikan",
                      genre: "Esai",
                      blocks: [{ type: "paragraph", text: "Halo" }],
                      source_title: null,
                      source_doc_id: null,
                      visibility: "publik",
                      group_id: null,
                      group_membership_id: null,
                      image: null,
                      created_at: "2026-11-26T00:00:00.000Z",
                      updated_at: "2026-11-26T00:00:00.000Z",
                      published_at: "2026-11-26T00:00:00.000Z",
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "profiles") {
          return {
            select: () => ({
              in: async () => ({
                data: [{ id: otherId, display_name: "Nadia", username: "nadia", country: "MY" }],
                error: null,
              }),
            }),
          };
        }
        if (table === "community_marks") {
          return {
            upsert,
            delete: () => ({ eq: delEq1 }),
          };
        }
        return {};
      },
      rpc: async () => ({ data: [{ post_id: postId, appreciations: 4, saves: 1 }], error: null }),
    } as unknown as SupabaseClient;

    const store = createSupabasePostStore(client, async () => uid);
    const posts = await store.listPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].appreciations).toBe(4);
    expect(authorOf(otherId)).toEqual({
      id: otherId,
      name: "Nadia",
      handle: "nadia",
      country: "MY",
    });

    await store.setMark(`ap:${postId}`, true);
    expect(upsert).toHaveBeenCalled();
    await store.setMark(`ap:${postId}`, false);
    expect(delEq2).toHaveBeenCalledWith("key", `ap:${postId}`);
  });
});
