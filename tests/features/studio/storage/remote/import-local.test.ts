import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { DailyLog } from "@/features/studio/daily-progress";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { importFromDevice, mergeLogs } from "@/features/studio/storage/remote/import-local";
import { createMemoryFileStore } from "@/lib/files/memory-file-store";

const day = (d: string, docs: DailyLog["docs"], activity?: DailyLog["activity"]): DailyLog => ({
  day: d,
  docs,
  ...(activity ? { activity } : {}),
});

describe("mergeLogs", () => {
  it("sends days the account does not have as they are", () => {
    const device = [day("2026-11-01", { a: { title: "A", words: 10 } })];
    expect(mergeLogs([], device)).toEqual(device);
  });

  it("adds device documents to a shared day and lets the account win on the same document", () => {
    const account = [day("2026-11-02", { a: { title: "A", words: 50 } })];
    const device = [
      day("2026-11-02", { a: { title: "A", words: 10 }, b: { title: "B", words: 5 } }),
    ];
    expect(mergeLogs(account, device)).toEqual([
      day("2026-11-02", { a: { title: "A", words: 50 }, b: { title: "B", words: 5 } }),
    ]);
  });

  it("keeps the account's activity, or the device's when the account has none", () => {
    const mine = { wordsReduced: 3, wordsAddedByHour: {} };
    const theirs = { wordsReduced: 9, wordsAddedByHour: { 9: 4 } };
    expect(mergeLogs([day("d", {}, mine)], [day("d", {}, theirs)])[0].activity).toEqual(mine);
    expect(mergeLogs([day("d", {})], [day("d", {}, theirs)])[0].activity).toEqual(theirs);
  });

  it("does not send days that only the account has", () => {
    expect(mergeLogs([day("2026-11-03", {})], [])).toEqual([]);
  });
});

describe("importFromDevice", () => {
  it("uploads local book covers to studio-covers when importing", async () => {
    const folderId = "11111111-1111-4111-8111-111111111111";
    const coverId = "22222222-2222-4222-8222-222222222222";
    const device = {
      listFolders: async () => [
        {
          id: folderId,
          name: "Novel",
          createdAt: 1000,
          kind: "book" as const,
          cover: { fileId: coverId, alt: "Sampul novel" },
        },
      ],
      list: async () => [],
      history: async () => [],
    } as unknown as DocumentStore;
    const account = {
      history: async () => [],
      importHistory: async () => {},
    } as unknown as DocumentStore;
    const deviceFiles = createMemoryFileStore();

    await deviceFiles.put({
      id: coverId,
      name: "cover.webp",
      type: "image/webp",
      size: 4,
      blob: new Blob(["webp"], { type: "image/webp" }),
      createdAt: 1000,
    });

    const upload = vi.fn(async () => ({ data: { path: `user-1/${coverId}` }, error: null }));
    const client = {
      auth: { getSession: async () => ({ data: { session: { user: { id: "user-1" } } } }) },
      from: () => ({
        upsert: () => ({ select: async () => ({ data: [{ id: folderId }], error: null }) }),
      }),
      rpc: async () => ({ data: true, error: null }),
      storage: { from: () => ({ upload }) },
    } as unknown as SupabaseClient;

    const summary = await importFromDevice(device, account, client, deviceFiles);
    expect(summary.folders).toBe(1);
    expect(upload).toHaveBeenCalledWith(
      `user-1/${coverId}`,
      expect.any(Blob),
      expect.objectContaining({ contentType: "image/webp", upsert: true }),
    );
  });
});
