import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useCommunity } from "@/features/community/hooks/use-community";
import { moderation } from "@/features/community/moderation/report-store";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";

beforeEach(() => {
  localStorage.clear();
  moderation.reset();
});
afterEach(cleanup);

describe("content a moderator took down", () => {
  it("leaves the feed, comes back when restored, and stays readable for moderators", async () => {
    const { result } = renderHook(() => useCommunity(createMemoryPostStore()));
    const { result: all } = renderHook(() =>
      useCommunity(createMemoryPostStore(), { includeRemoved: true }),
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    await waitFor(() => expect(all.current.status).toBe("ready"));
    const id = "toples-kerupuk";
    expect(result.current.posts.some((p) => p.id === id)).toBe(true);

    act(() =>
      moderation.write([{ kind: "post", targetId: id, decision: "sembunyikan", by: "m", at: 1 }]),
    );
    expect(result.current.posts.some((p) => p.id === id)).toBe(false);
    expect(result.current.comments.every((c) => c.postId !== id)).toBe(true);
    expect(all.current.posts.some((p) => p.id === id)).toBe(true);

    act(() =>
      moderation.write([
        { kind: "post", targetId: id, decision: "sembunyikan", by: "m", at: 1 },
        { kind: "post", targetId: id, decision: "pulihkan", by: "m", at: 2 },
      ]),
    );
    expect(result.current.posts.some((p) => p.id === id)).toBe(true);
  });

  it("drops a deleted comment", async () => {
    const { result } = renderHook(() => useCommunity(createMemoryPostStore()));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.comments.some((c) => c.id === "c-hujan-3")).toBe(true);
    act(() =>
      moderation.write([
        { kind: "comment", targetId: "c-hujan-3", decision: "hapus", by: "m", at: 1 },
      ]),
    );
    expect(result.current.comments.some((c) => c.id === "c-hujan-3")).toBe(false);
  });
});
