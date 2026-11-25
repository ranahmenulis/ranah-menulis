import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { importFromDevice, pendingImport } from "@/features/studio/storage/remote/import-local";
import { createSupabaseStore } from "@/features/studio/storage/remote/supabase-store";
import { cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

// The Supabase document store against the real project: what the app does when someone is signed in.

const text = (value: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: value }] }],
});
const words = (n: number) => Array.from({ length: n }, (_, i) => `kata${i}`).join(" ");
const input = (id: string, body: string, wordCount: number, extra = {}) => ({
  id,
  title: "Judul",
  content: text(body),
  wordCount,
  ...extra,
});

describe("Supabase document store", () => {
  let a: TestUser;
  let b: TestUser;
  let store: DocumentStore;
  let other: DocumentStore;

  beforeAll(async () => {
    a = await createTestUser("sa");
    b = await createTestUser("sb");
    store = createSupabaseStore(a.client, () => "Asia/Jakarta");
    other = createSupabaseStore(b.client, () => "Asia/Jakarta");
  });
  afterAll(cleanupTestUsers);

  it("saves, reads back with millisecond times, and records today's words", async () => {
    const id = randomUUID();
    const saved = await store.save(input(id, "satu dua tiga", 3), 0);
    if (!saved.ok) throw new Error("conflict");
    expect(saved.doc.version).toBe(1);
    expect(saved.doc.createdAt).toBeGreaterThan(Date.now() - 60_000);
    expect(saved.progress.docs[id].words).toBe(3);

    const read = await store.get(id);
    expect(read?.wordCount).toBe(3);
    expect(read?.content).toEqual(text("satu dua tiga"));
    expect(read && "kind" in read).toBe(false);

    const today = await store.today();
    expect(today.docs[id].words).toBe(3);
    expect((await store.history()).some((log) => log.docs[id])).toBe(true);
  });

  it("returns a conflict for a stale save and keeps the stored text", async () => {
    const id = randomUUID();
    const first = await store.save(input(id, "awal", 1), 0);
    if (!first.ok) throw new Error("conflict");
    const second = await store.save(input(id, "kedua", 1), 1);
    expect(second.ok).toBe(true);
    const stale = await store.save(input(id, "basi", 1), 1);
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.conflict.version).toBe(2);
    expect((await store.get(id))?.content).toEqual(text("kedua"));
  });

  it("keeps targets and layout through later saves that send none", async () => {
    const id = randomUUID();
    const targets = [{ id: "t1", words: 500, due: "2026-12-31" }];
    const layout = { font: "serif", size: 12, lineHeight: 1.5, margin: 20 };
    await store.save(input(id, "x", 1, { targets, layout }), 0);
    const later = await store.save(input(id, "xy", 1), 1);
    if (!later.ok) throw new Error("conflict");
    expect(later.doc.targets).toEqual(targets);
    expect(later.doc.layout).toEqual(layout);
  });

  it("keeps a first snapshot and a protective one before a large deletion", async () => {
    const id = randomUUID();
    const big = await store.save(input(id, words(400), 400), 0);
    if (!big.ok) throw new Error("conflict");
    expect((await store.listVersions(id)).map((v) => v.reason)).toEqual(["berkala"]);
    // Version 2 is not due for a periodic snapshot, so only the deletion keeps its text.
    await store.save(input(id, words(401), 401), 1);
    await store.save(input(id, words(20), 20), 2);
    const versions = await store.listVersions(id);
    const protective = versions.find((v) => v.reason === "pelindung");
    expect(protective?.wordCount).toBe(401);
    expect(protective?.id).toBe(`${id}:v2`);
  });

  it("adds a version before a restore", async () => {
    const id = randomUUID();
    await store.save(input(id, "x", 1), 0);
    await store.addVersion({
      id: `${id}:v9`,
      docId: id,
      savedAt: Date.now(),
      title: "t",
      content: text("sebelum"),
      wordCount: 1,
      reason: "pemulihan",
    });
    expect((await store.listVersions(id)).some((v) => v.reason === "pemulihan")).toBe(true);
  });

  it("trashes, restores, archives and deletes only from the trash", async () => {
    const id = randomUUID();
    await store.save(input(id, "x", 1), 0);
    await store.deletePermanently(id);
    expect(await store.get(id)).not.toBeNull();

    const trashed = await store.updateMeta(id, { deletedAt: Date.now() });
    expect(trashed?.deletedAt).toBeGreaterThan(0);
    const restored = await store.updateMeta(id, { deletedAt: null });
    expect(restored?.deletedAt).toBeNull();

    const archived = await store.setArchived(id, true);
    expect(archived?.archivedAt).toBeGreaterThan(0);
    expect(await store.setArchived(id, true)).toBeNull();
    expect(await store.updateMeta(id, { title: "x" })).toBeNull();
    await store.setArchived(id, false);

    await store.updateMeta(id, { deletedAt: Date.now() });
    await store.deletePermanently(id);
    expect(await store.get(id)).toBeNull();
  });

  it("classifies a document and refuses a stale or invalid change", async () => {
    const id = randomUUID();
    await store.save(input(id, "x", 1), 0);
    const saved = await store.updateClassification(id, {}, { kind: "cerpen", tags: ["laut"] });
    expect(saved.status).toBe("saved");
    const stale = await store.updateClassification(id, {}, { kind: "puisi" });
    expect(stale.status).toBe("conflict");
    const invalid = await store.updateClassification(
      id,
      { kind: "cerpen", tags: ["laut"] },
      // @ts-expect-error not a document type
      { kind: "bukan" },
    );
    expect(invalid.status).toBe("invalid");
    expect((await store.get(id))?.version).toBe(1);
  });

  it("duplicates an active document and a given version", async () => {
    const id = randomUUID();
    await store.save(input(id, "salin", 1, { targets: [{ id: "t", words: 9 }] }), 0);
    const copy = await store.duplicateActive(id);
    expect(copy?.title).toBe("Judul (salinan)");
    expect(copy?.targets).toBeUndefined();
    const source = await store.get(id);
    const kept = await store.duplicate(source!, "Keduanya");
    expect(kept.version).toBe(1);
    expect(kept.id).not.toBe(id);
    expect(await store.duplicateActive("baru")).toBeNull();
  });

  it("lists summaries without bodies and every document in full", async () => {
    const id = randomUUID();
    await store.save(input(id, "daftar", 1), 0);
    const summaries = await store.listSummaries();
    const found = summaries.find((s) => s.id === id);
    expect(found).toBeDefined();
    expect(found && "content" in found).toBe(false);
    expect((await store.list()).find((d) => d.id === id)?.content).toEqual(text("daftar"));
  });

  it("keeps one person's documents out of another's store", async () => {
    const id = randomUUID();
    await store.save(input(id, "rahasia", 1), 0);
    expect(await other.get(id)).toBeNull();
    expect((await other.listSummaries()).some((s) => s.id === id)).toBe(false);
    await expect(other.save(input(id, "curian", 1), 1)).rejects.toThrow();
  });

  it("returns null for the placeholder id of an unsaved document", async () => {
    expect(await store.get("baru")).toBeNull();
  });

  it("creates, edits and files a book", async () => {
    const book = await store.createFolder("Naskahku", { kind: "book", genre: "novel" });
    expect(book).toMatchObject({ name: "Naskahku", kind: "book", genre: "novel" });
    const chapter = randomUUID();
    await store.save(input(chapter, "bab", 1, { folderId: book.id }), 0);
    expect((await store.get(chapter))?.folderId).toBe(book.id);

    const ordered = await store.updateFolder(book.id, {
      chapterOrder: [chapter],
      cover: { fileId: "f", alt: "sampul" },
    });
    expect(ordered?.chapterOrder).toEqual([chapter]);
    expect(ordered?.cover).toEqual({ fileId: "f", alt: "sampul" });
    expect((await store.updateFolder(book.id, { cover: null }))?.cover).toBeUndefined();

    await store.renameFolder(book.id, "Judul Baru");
    expect((await store.listFolders()).find((f) => f.id === book.id)?.name).toBe("Judul Baru");
    expect(await store.updateFolder(randomUUID(), { name: "x" })).toBeNull();
  });

  it("imports what a device holds, once", async () => {
    const plain = { id: randomUUID(), name: "Biasa", createdAt: 1_700_000_000_000 };
    const book = {
      id: randomUUID(),
      name: "Buku",
      createdAt: 1_700_000_100_000,
      kind: "book" as const,
      collectionId: plain.id,
    };
    const doc = (id: string, folderId: string | null) => ({
      id,
      title: "Lama",
      content: text("dari perangkat"),
      wordCount: 2,
      version: 4,
      updatedAt: 1_700_000_200_000,
      createdAt: 1_700_000_150_000,
      folderId,
    });
    const docs = [doc(randomUUID(), book.id), doc(randomUUID(), null), doc("bukan-uuid", null)];
    const device = {
      listFolders: async () => [book, plain],
      list: async () => docs,
      history: async () => [
        { day: "2026-01-02", docs: { [docs[0].id]: { title: "Lama", words: 2 } } },
      ],
    } as unknown as DocumentStore;

    const deviceWithSummaries = {
      ...device,
      listSummaries: async () => docs,
    } as unknown as DocumentStore;
    // Before: the two valid documents and the two folders wait; the invalid id never counts.
    expect(await pendingImport(deviceWithSummaries, store)).toEqual({ documents: 2, folders: 2 });

    const first = await importFromDevice(device, store, a.client);
    expect(first).toEqual({ folders: 2, documents: 2, skipped: 1, days: 1 });
    const imported = await store.get(docs[0].id);
    expect(imported?.version).toBe(4);
    expect(imported?.folderId).toBe(book.id);
    expect((await store.listFolders()).find((f) => f.id === book.id)?.collectionId).toBe(plain.id);
    expect((await store.history()).find((l) => l.day === "2026-01-02")).toBeDefined();

    expect(await pendingImport(deviceWithSummaries, store)).toEqual({ documents: 0, folders: 0 });
    const again = await importFromDevice(device, store, a.client);
    expect(again).toEqual({ folders: 0, documents: 0, skipped: 1, days: 1 });
    expect((await store.get(docs[0].id))?.title).toBe("Lama");
  });
});
