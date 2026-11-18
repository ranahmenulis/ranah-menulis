import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSubmittedDocumentIds } from "@/features/projects/hooks/use-submitted-documents";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { notifySubmissionsChanged } from "@/features/projects/storage/submission-events";
import { useSubmissions } from "@/features/projects/use-submissions";
import { submission } from "./helpers";

describe("useSubmissions", () => {
  it("loads newest first", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "old", docId: "a", submittedAt: 1 }), 5);
    await store.add(submission({ id: "new", docId: "b", submittedAt: 9 }), 5);
    const { result } = renderHook(() => useSubmissions(store));
    await act(async () => {});
    expect(result.current.status).toBe("ready");
    expect(result.current.submissions.map((s) => s.id)).toEqual(["new", "old"]);
  });

  it("reads again when something is sent elsewhere, so cached pages never go stale", async () => {
    const store = createMemorySubmissionStore();
    const { result } = renderHook(() => useSubmissions(store));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.submissions).toHaveLength(0);

    await store.add(submission({ id: "a" }), 5);
    act(() => notifySubmissionsChanged());
    await waitFor(() => expect(result.current.submissions).toHaveLength(1));
  });

  it("keeps the newer read when an older read finishes after a change signal", async () => {
    let finishFirst!: (works: Submission[]) => void;
    const first = new Promise<Submission[]>((resolve) => {
      finishFirst = resolve;
    });
    const store = createMemorySubmissionStore();
    const newer = submission({ id: "newer" });
    vi.spyOn(store, "list").mockReturnValueOnce(first).mockResolvedValue([newer]);
    const { result } = renderHook(() => useSubmissions(store));

    await act(async () => notifySubmissionsChanged());
    expect(result.current.submissions).toEqual([newer]);

    await act(async () => finishFirst([submission({ id: "older" })]));
    expect(result.current.submissions).toEqual([newer]);
  });

  it("is an error, not an empty list, when the read fails, and retries", async () => {
    let fail = true;
    const store: SubmissionStore = {
      list: async () => (fail ? Promise.reject(new Error("idb")) : [submission()]),
      add: async () => "ok",
      update: async () => "ok" as const,
    };
    const { result } = renderHook(() => useSubmissions(store));
    await waitFor(() => expect(result.current.status).toBe("error"));
    fail = false;
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.submissions).toHaveLength(1);
  });
});

describe("useSubmittedDocumentIds", () => {
  it("lists the documents that were sent, except withdrawn works", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", docId: "d1" }), 5);
    await store.add(submission({ id: "b", docId: "d2", status: "ditarik" }), 5);
    const { result } = renderHook(() => useSubmittedDocumentIds(store));
    await waitFor(() => expect(result.current.has("d1")).toBe(true));
    expect(result.current.has("d2")).toBe(false);
  });

  it("shows no tags, without an error, when the read fails", async () => {
    const store: SubmissionStore = {
      list: () => Promise.reject(new Error("x")),
      add: async () => "ok",
      update: async () => "ok" as const,
    };
    const { result } = renderHook(() => useSubmittedDocumentIds(store));
    await new Promise((r) => setTimeout(r, 20));
    expect(result.current.size).toBe(0);
  });
});
