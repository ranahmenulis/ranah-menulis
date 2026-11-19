import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDocumentSearch } from "@/features/studio/hooks/use-document-search";
import type { StudioDocument } from "@/features/studio/storage/document-store";

const doc: StudioDocument = {
  id: "1",
  title: "Catatan",
  content: {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "Pagi" }] }],
  },
  version: 1,
  updatedAt: 0,
  wordCount: 1,
};
const candidates = [doc];
const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useDocumentSearch", () => {
  it("debounces typing and discards an old body read that resolves after the new query", async () => {
    vi.useFakeTimers();
    const oldRead = Promise.withResolvers<StudioDocument>();
    const get = vi.fn().mockReturnValueOnce(oldRead.promise).mockResolvedValue(doc);
    const store = { get };
    const { result, rerender } = renderHook(
      ({ query }) => useDocumentSearch(store, candidates, query),
      {
        initialProps: { query: "Pa" },
      },
    );
    await advance(249);
    expect(get).not.toHaveBeenCalled();
    rerender({ query: "Pagi" });
    await advance(250);
    expect(get).toHaveBeenCalledTimes(1);
    rerender({ query: "Senja" });
    await advance(250);
    expect(result.current).toMatchObject({ status: "ready", ids: new Set() });
    await act(async () => oldRead.resolve(doc));
    expect(result.current).toMatchObject({ status: "ready", ids: new Set() });
  });

  it("can retry a failed body read without clearing the query", async () => {
    vi.useFakeTimers();
    const store = { get: vi.fn().mockRejectedValueOnce(new Error("IDB")).mockResolvedValue(doc) };
    const { result } = renderHook(() => useDocumentSearch(store, candidates, "pagi"));
    await advance(250);
    expect(result.current.status).toBe("error");
    if (result.current.status === "error") act(result.current.retry);
    await advance(250);
    expect(result.current).toMatchObject({ status: "ready", ids: new Set([doc.id]) });
  });
});
