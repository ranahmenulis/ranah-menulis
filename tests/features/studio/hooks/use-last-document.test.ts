import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLastDocument } from "@/features/studio/hooks/use-last-document";
import type { StudioDocument } from "@/features/studio/storage/document-store";

const doc = (id: string, updatedAt: number): StudioDocument => ({
  id,
  title: id,
  content: { type: "doc" },
  wordCount: 1,
  version: 1,
  updatedAt,
});

const storeWith = (listSummaries: () => Promise<StudioDocument[]>) => ({ listSummaries });

describe("useLastDocument", () => {
  it("is null while loading, then the newest document", async () => {
    const store = storeWith(() => Promise.resolve([doc("old", 1), doc("new", 2)]));
    const { result } = renderHook(() => useLastDocument(store, "/beranda"));
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current?.id).toBe("new"));
  });

  it("stays null when the store cannot be read", async () => {
    const list = vi.fn(() => Promise.reject(new Error("no indexedDB")));
    const { result } = renderHook(() => useLastDocument(storeWith(list), "/beranda"));
    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it("reads again when the route changes, so the title is not stale", async () => {
    let docs = [doc("a", 1)];
    const store = storeWith(() => Promise.resolve(docs));
    const { result, rerender } = renderHook(({ key }) => useLastDocument(store, key), {
      initialProps: { key: "/studio" },
    });
    await waitFor(() => expect(result.current?.id).toBe("a"));

    docs = [doc("a", 1), doc("b", 5)];
    rerender({ key: "/beranda" });
    await waitFor(() => expect(result.current?.id).toBe("b"));
  });
});
