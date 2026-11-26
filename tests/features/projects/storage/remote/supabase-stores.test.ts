import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseSubmissionStore } from "@/features/projects/storage/remote/supabase-submission-store";
import { createSupabaseAssignmentStore } from "@/features/projects/kelas/storage/remote/supabase-assignment-store";
import { createSupabaseSoloStore } from "@/features/projects/solo/storage/remote/supabase-solo-store";

function mockClient(rows: Record<string, unknown>[]) {
  const inserted: unknown[] = [];
  const updated: unknown[] = [];
  const client = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: rows, error: null })),
        })),
        limit: vi.fn(async () => ({ data: rows, error: null })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: rows[0] ?? null, error: null })),
        })),
      })),
      insert: vi.fn(async (payload: unknown) => {
        inserted.push(payload);
        return { error: null };
      }),
      update: vi.fn((payload: unknown) => ({
        eq: vi.fn(async () => {
          updated.push(payload);
          return { error: null };
        }),
      })),
    })),
  } as unknown as SupabaseClient;
  return { client, inserted, updated };
}

describe("Supabase Projects remote stores", () => {
  it("lists, adds, and updates submissions via project_submissions", async () => {
    const row = {
      id: "sub-1",
      slug: "antologi-uji",
      author_id: "user-1",
      title: "Cerpen Uji",
      genre: "Cerpen",
      note: "",
      synopsis: null,
      package_name: null,
      originality_agreed_at: "2026-11-26T00:00:00.000Z",
      doc_id: "doc-1",
      doc_title: "Draf 1",
      status: "terkirim",
      status_log: [],
      versions: [],
      submitted_at: "2026-11-26T00:00:00.000Z",
    };
    const { client, inserted, updated } = mockClient([row]);
    const store = createSupabaseSubmissionStore(client, "user-1");

    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Cerpen Uji");

    const dup = await store.add({ ...list[0], id: "sub-2" }, 3);
    expect(dup).toBe("duplicate");
    expect(inserted).toHaveLength(0);

    const ok = await store.add({ ...list[0], id: "sub-3", docId: "doc-2" }, 3);
    expect(ok).toBe("ok");
    expect(inserted).toHaveLength(1);

    const upd = await store.update("sub-1", (cur) => ({ ...cur, status: "diterima" }));
    expect(upd).toBe("ok");
    expect(updated).toHaveLength(1);
  });

  it("lists, adds, and updates class assignments via class_assignments", async () => {
    const row = {
      id: "asg-1",
      slug: "kelas-uji",
      assignment_id: "t-1",
      user_id: "user-1",
      source: "teks",
      doc_id: null,
      doc_title: "Tugas 1",
      status: "dikumpulkan",
      late: false,
      submitted_at: "2026-11-26T00:00:00.000Z",
      versions: [],
      status_log: [],
    };
    const { client, inserted, updated } = mockClient([row]);
    const store = createSupabaseAssignmentStore(client, "user-1");

    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(await store.add({ ...list[0], id: "asg-2" })).toBe("duplicate");
    expect(await store.add({ ...list[0], id: "asg-3", assignmentId: "t-2" })).toBe("ok");
    expect(inserted).toHaveLength(1);
    expect(await store.update("asg-1", (cur) => ({ ...cur, status: "selesai" }))).toBe("ok");
    expect(updated).toHaveLength(1);
  });

  it("lists, adds, and updates Solo progress via solo_progress", async () => {
    const row = { submission_id: "sub-1", slug: "solo-uji", log: [], files: [] };
    const { client, inserted, updated } = mockClient([row]);
    const store = createSupabaseSoloStore(client);

    const list = await store.list();
    expect(list).toEqual([{ id: "sub-1", slug: "solo-uji", log: [], files: [] }]);
    expect(await store.add({ id: "sub-2", slug: "solo-uji", log: [], files: [] })).toBe("ok");
    expect(inserted).toHaveLength(1);
    expect(
      await store.update("sub-1", (cur) => ({
        ...cur,
        log: [{ kind: "lanjut", stage: "penyuntingan", at: 1, by: "organizer" }],
      })),
    ).toBe("ok");
    expect(updated).toHaveLength(1);
  });
});
