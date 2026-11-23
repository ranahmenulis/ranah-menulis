import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyLog } from "@/features/studio/daily-progress";
import { useStudioDocument } from "@/features/studio/hooks/use-studio-document";
import type { DocumentStore, SaveResult } from "@/features/studio/storage/document-store";

const content = { type: "doc", content: [{ type: "paragraph" }] };

function makeStore(folderIds: string[]) {
  const save = vi.fn<DocumentStore["save"]>(async (input, base): Promise<SaveResult> => ({
    ok: true,
    doc: { ...input, version: base + 1, updatedAt: Date.now() },
    progress: emptyLog(),
  }));
  const store = {
    save,
    today: vi.fn(async () => emptyLog()),
    listFolders: vi.fn(async () => folderIds.map((id) => ({ id, name: id, createdAt: 0 }))),
  } as unknown as DocumentStore;
  return { store, save };
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useStudioDocument: new document in a folder", () => {
  it("files a new draft in the given folder on its first save only", async () => {
    const { store, save } = makeStore(["f1"]);
    const { result } = renderHook(() => useStudioDocument("baru", store, undefined, "f1"));
    await advance(0);

    act(() => result.current.onContentChange(content, 3));
    await advance(1000);
    expect(save.mock.calls[0][0]).toMatchObject({ folderId: "f1" });

    act(() => result.current.onContentChange(content, 4));
    await advance(1000);
    expect(save.mock.calls[1][0]).not.toHaveProperty("folderId");
  });

  it("ignores a folder that no longer exists", async () => {
    const { store, save } = makeStore([]);
    const { result } = renderHook(() => useStudioDocument("baru", store, undefined, "gone"));
    await advance(0);

    act(() => result.current.onContentChange(content, 3));
    await advance(1000);
    expect(save.mock.calls[0][0]).not.toHaveProperty("folderId");
  });
});
