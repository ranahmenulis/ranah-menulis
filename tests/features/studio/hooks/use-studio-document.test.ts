import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyLog } from "@/features/studio/daily-progress";
import type {
  DocumentStore,
  SaveResult,
  StudioDocument,
} from "@/features/studio/storage/document-store";
import { useStudioDocument } from "@/features/studio/hooks/use-studio-document";

const content = { type: "doc", content: [{ type: "paragraph" }] };

function stored(over: Partial<StudioDocument> = {}): StudioDocument {
  return {
    id: "doc-1",
    title: "Surat",
    content,
    wordCount: 10,
    version: 2,
    updatedAt: 1000,
    ...over,
  };
}

function makeStore(over: Partial<DocumentStore> = {}) {
  const save = vi.fn<DocumentStore["save"]>(async (input, base): Promise<SaveResult> => ({
    ok: true,
    doc: { ...input, version: base + 1, updatedAt: Date.now() },
    progress: emptyLog(),
  }));
  const store: DocumentStore = {
    get: vi.fn(async () => stored()),
    save,
    today: vi.fn(async () => emptyLog()),
    duplicate: vi.fn(async (source, title) => ({ ...source, id: "copy", title, version: 1 })),
    list: vi.fn(async () => []),
    listFolders: vi.fn(async () => []),
    history: vi.fn(async () => []),
    updateMeta: vi.fn(async () => null),
    deletePermanently: vi.fn(async () => {}),
    importHistory: vi.fn(async () => {}),
    createFolder: vi.fn(async (name) => ({ id: "f", name, createdAt: 0 })),
    renameFolder: vi.fn(async () => {}),
    ...over,
  };
  return { store, save };
}

/** Let pending promises settle, then move the fake clock. */
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

describe("useStudioDocument: opening", () => {
  it("loads an existing document with its title, word count and saved state", async () => {
    const { store } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);

    expect(result.current.load).toBe("ready");
    expect(result.current.title).toBe("Surat");
    expect(result.current.words).toBe(10);
    expect(result.current.status).toBe("saved");
  });

  it("reports a missing document", async () => {
    const { store } = makeStore({ get: vi.fn(async () => null) });
    const { result } = renderHook(() => useStudioDocument("nope", store));
    await advance(0);

    expect(result.current.load).toBe("missing");
  });

  it("reports an error when the store fails to open", async () => {
    const { store } = makeStore({ get: vi.fn(async () => Promise.reject(new Error("idb"))) });
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);

    expect(result.current.load).toBe("error");
  });

  it("opens a new draft immediately as 'draft' without touching the store", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("baru", store));
    await advance(0);

    expect(result.current.load).toBe("ready");
    expect(result.current.status).toBe("draft");
    expect(store.get).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe("useStudioDocument: autosave", () => {
  it("saves after a typing pause, not on every keystroke", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);

    act(() => result.current.setTitle("Surat untuk Kakek"));
    await advance(400);
    act(() => result.current.setTitle("Surat untuk Kakek di Pelabuhan"));
    await advance(400);
    expect(save).not.toHaveBeenCalled();

    await advance(500);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].title).toBe("Surat untuk Kakek di Pelabuhan");
    expect(save.mock.calls[0][1]).toBe(2); // base version = the version that was opened
    expect(result.current.status).toBe("saved");
  });

  it("does not store an untouched new draft, then stores it once something is written", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("baru", store));
    await advance(0);

    act(() => result.current.setTitle("   "));
    await advance(1000);
    expect(save).not.toHaveBeenCalled();

    act(() => result.current.onContentChange(content, 3));
    await advance(1000);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][1]).toBe(0);
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.stringMatching(/^\/studio\/.+/),
    );
  });

  it("shows 'failed' when the device cannot store the change, then retries", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    save.mockRejectedValueOnce(new Error("quota"));

    act(() => result.current.setTitle("Baru"));
    await advance(900);
    expect(result.current.status).toBe("failed");

    await advance(5000);
    expect(save).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("saved");
  });

  it("writes pending changes immediately when the tab is hidden", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);

    act(() => result.current.setTitle("Belum sempat tersimpan"));
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(save).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  });
});

describe("useStudioDocument: conflicts", () => {
  const remote = stored({ version: 5, title: "Dari tab lain" });

  async function conflicted() {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    save.mockResolvedValueOnce({ ok: false, conflict: remote });
    act(() => result.current.setTitle("Versi saya"));
    await advance(900);
    return { result, store, save };
  }

  it("raises a conflict instead of overwriting, and stops autosaving", async () => {
    const { result, save } = await conflicted();

    expect(result.current.conflict?.remote).toEqual(remote);
    expect(result.current.conflict?.local.title).toBe("Versi saya");

    act(() => result.current.setTitle("Versi saya, diedit lagi"));
    await advance(2000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("'local' saves this device's version on top of the newer one", async () => {
    const { result, save } = await conflicted();

    await act(async () => {
      await result.current.resolveConflict("local");
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][1]).toBe(5);
    expect(save.mock.calls[1][0].title).toBe("Versi saya");
    expect(result.current.conflict).toBeNull();
  });

  it("'remote' adopts the other version without saving anything", async () => {
    const { result, save } = await conflicted();
    const keyBefore = result.current.editorKey;

    await act(async () => {
      await result.current.resolveConflict("remote");
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(result.current.title).toBe("Dari tab lain");
    expect(result.current.editorKey).toBe(keyBefore + 1);
    expect(result.current.conflict).toBeNull();
  });

  it("'both' keeps the other version as a new document, then saves this one", async () => {
    const { result, store, save } = await conflicted();

    await act(async () => {
      await result.current.resolveConflict("both");
    });

    expect(store.duplicate).toHaveBeenCalledWith(remote, "Dari tab lain (versi lain)");
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][1]).toBe(5);
  });
});
