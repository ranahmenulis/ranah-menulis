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
    listVersions: vi.fn(async () => []),
    addVersion: vi.fn(async () => {}),
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

describe("useStudioDocument: saveNow", () => {
  it("stores pending text straight away and reports it safe", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    act(() => result.current.setTitle("Surat baru"));

    let ok = false;
    await act(async () => {
      ok = await result.current.saveNow();
    });

    expect(ok).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].title).toBe("Surat baru");
  });

  it("is true without writing when nothing changed, or when a new draft is still untouched", async () => {
    const { store, save } = makeStore();
    const opened = renderHook(() => useStudioDocument("doc-1", store));
    const fresh = renderHook(() => useStudioDocument("baru", store));
    await advance(0);

    let a = false;
    let b = false;
    await act(async () => {
      a = await opened.result.current.saveNow();
      b = await fresh.result.current.saveNow();
    });

    expect([a, b]).toEqual([true, true]);
    expect(save).not.toHaveBeenCalled();
  });

  it("waits for a save already in progress before reporting", async () => {
    let finish: () => void = () => {};
    const slow = vi.fn<DocumentStore["save"]>(
      (input, base) =>
        new Promise<SaveResult>((resolve) => {
          finish = () =>
            resolve({
              ok: true,
              doc: { ...input, version: base + 1, updatedAt: 1 },
              progress: emptyLog(),
            });
        }),
    );
    const { store } = makeStore({ save: slow });
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    act(() => result.current.setTitle("Surat"));
    await advance(1000); // autosave started and is still running

    let ok: boolean | null = null;
    act(() => {
      void result.current.saveNow().then((v) => (ok = v));
    });
    await advance(200);
    expect(ok).toBeNull();

    await act(async () => finish());
    await advance(100);
    expect(ok).toBe(true);
  });

  it("is false while the document is in conflict, and false when the device refuses the save", async () => {
    const conflicted = makeStore({
      save: vi.fn(async (): Promise<SaveResult> => ({
        ok: false,
        conflict: stored({ version: 9 }),
      })),
    });
    const a = renderHook(() => useStudioDocument("doc-1", conflicted.store));
    await advance(0);
    act(() => a.result.current.setTitle("Lain"));
    await advance(1000);
    let first = true;
    await act(async () => {
      first = await a.result.current.saveNow();
    });
    expect(first).toBe(false);

    const failing = makeStore({ save: vi.fn(async () => Promise.reject(new Error("idb"))) });
    const b = renderHook(() => useStudioDocument("doc-1", failing.store));
    await advance(0);
    act(() => b.result.current.setTitle("Lain"));
    let second = true;
    await act(async () => {
      second = await b.result.current.saveNow();
    });
    expect(second).toBe(false);
  });

  it("exposes the id a new draft is stored under", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("baru", store));
    await advance(0);
    act(() => result.current.setTitle("Mulai"));
    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.getId()).not.toBe("");
    expect(save.mock.calls[0][0].id).toBe(result.current.getId());
  });
});

describe("useStudioDocument: document targets", () => {
  const target = { id: "t1", words: 1000, due: "2026-12-01" };

  it("loads the stored targets and drops invalid ones", async () => {
    const { store } = makeStore({
      get: vi.fn(async () =>
        stored({ targets: [target, { id: 5, words: -1 }] as unknown as StudioDocument["targets"] }),
      ),
    });
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    expect(result.current.targets).toEqual([target]);
  });

  it("saves new targets with the text on the next autosave, on the version it opened, with no conflict", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);

    act(() => result.current.setTargets([target]));
    await advance(900);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].targets).toEqual([target]);
    expect(save.mock.calls[0][1]).toBe(2);
    expect(result.current.conflict).toBeNull();
    expect(result.current.status).toBe("saved");

    // The next edit builds on the new version instead of clashing with it.
    act(() => result.current.setTitle("Surat baru"));
    await advance(900);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][1]).toBe(3);
    expect(result.current.conflict).toBeNull();
  });

  it("adopts the other version's targets when 'remote' is chosen in a conflict", async () => {
    const remoteTarget = { id: "r1", words: 500, due: null };
    const remote = stored({ version: 5, targets: [remoteTarget] });
    const { store } = makeStore({
      save: vi.fn(async () => ({ ok: false as const, conflict: remote })),
    });
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    act(() => result.current.setTitle("Lokal"));
    await advance(900);
    expect(result.current.conflict).not.toBeNull();

    await act(async () => {
      await result.current.resolveConflict("remote");
    });
    expect(result.current.targets).toEqual([remoteTarget]);
  });
});

describe("useStudioDocument: restoring a version", () => {
  const old = {
    id: "doc-1:v1",
    docId: "doc-1",
    savedAt: 500,
    title: "Surat lama",
    content: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "dulu" }] }],
    },
    wordCount: 1,
    reason: "berkala" as const,
  };

  it("keeps the current text as a version first, then loads the old one and saves it without a conflict", async () => {
    const { store, save } = makeStore();
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);
    const keyBefore = result.current.editorKey;

    let ok = false;
    await act(async () => {
      ok = await result.current.restoreVersion(old);
    });

    expect(ok).toBe(true);
    expect(store.addVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        docId: "doc-1",
        reason: "pemulihan",
        title: "Surat",
        wordCount: 10,
      }),
    );
    expect(result.current.title).toBe("Surat lama");
    expect(result.current.words).toBe(1);
    expect(result.current.initial.content).toEqual(old.content);
    expect(result.current.editorKey).toBe(keyBefore + 1);

    await advance(900);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toMatchObject({ title: "Surat lama", wordCount: 1 });
    expect(save.mock.calls[0][1]).toBe(2); // the version this tab opened, so no conflict
    expect(result.current.conflict).toBeNull();
  });

  it("changes nothing when the current text cannot be kept first", async () => {
    const { store, save } = makeStore({
      addVersion: vi.fn(async () => Promise.reject(new Error("full"))),
    });
    const { result } = renderHook(() => useStudioDocument("doc-1", store));
    await advance(0);

    let ok = true;
    await act(async () => {
      ok = await result.current.restoreVersion(old);
    });

    expect(ok).toBe(false);
    expect(result.current.title).toBe("Surat");
    await advance(900);
    expect(save).not.toHaveBeenCalled();
  });

  it("refuses for a draft that was never stored", async () => {
    const { store } = makeStore();
    const { result } = renderHook(() => useStudioDocument("baru", store));
    await advance(0);
    let ok = true;
    await act(async () => {
      ok = await result.current.restoreVersion(old);
    });
    expect(ok).toBe(false);
    expect(store.addVersion).not.toHaveBeenCalled();
  });
});
