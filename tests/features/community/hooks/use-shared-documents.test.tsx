import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSharedDocumentIds } from "@/features/community/hooks/use-shared-documents";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import type { PostStore, StoredPost } from "@/features/community/storage/post-store";

const post = (over: Partial<StoredPost>): StoredPost => ({
  id: "p1",
  status: "published",
  title: "T",
  kind: "prolog",
  genre: "Cerpen",
  blocks: [],
  sourceTitle: "Dokumen",
  sourceDocId: "d1",
  visibility: "publik",
  updatedAt: 1,
  ...over,
});

describe("useSharedDocumentIds", () => {
  it("reads which documents were shared from the local posts", async () => {
    const store = createMemoryPostStore();
    await store.putPost(post({ id: "p1", sourceDocId: "d1" }));
    await store.putPost(post({ id: "p2", sourceDocId: "d2", status: "draft" }));

    const { result } = renderHook(() => useSharedDocumentIds(store));

    await waitFor(() => expect(result.current.has("d1")).toBe(true));
    expect(result.current.has("d2")).toBe(false);
  });

  it("shows no tags, without an error, when the posts cannot be read", async () => {
    const store: PostStore = {
      ...createMemoryPostStore(),
      listPosts: () => Promise.reject(new Error("idb")),
    };
    const { result } = renderHook(() => useSharedDocumentIds(store));
    await new Promise((r) => setTimeout(r, 20));
    expect(result.current.size).toBe(0);
  });
});
