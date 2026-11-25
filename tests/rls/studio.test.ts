import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

const content = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  ),
  (char) => char.charCodeAt(0),
);

type Save = {
  id: string;
  base?: number;
  title?: string;
  text?: string;
  words?: number;
  day?: string | null;
  docWords?: number | null;
  activity?: Record<string, number> | null;
  versions?: unknown[];
  folder?: string | null;
};

function rpcSave(user: TestUser, s: Save) {
  return user.client.rpc("studio_save_document", {
    p_id: s.id,
    p_title: s.title ?? "Judul",
    p_content: content(s.text ?? "isi"),
    p_word_count: s.words ?? 1,
    p_base_version: s.base ?? 0,
    p_folder_id: s.folder ?? null,
    p_day: s.day === undefined ? today() : s.day,
    p_doc_words: s.docWords === undefined ? (s.words ?? 1) : s.docWords,
    p_activity: s.activity ?? null,
    p_versions: s.versions ?? [],
  });
}

const today = () => new Date().toISOString().slice(0, 10);

describe("RLS: Studio", () => {
  let a: TestUser;
  let b: TestUser;
  let seedAdmin: TestUser;
  const docA = randomUUID();

  beforeAll(async () => {
    a = await createTestUser("a");
    b = await createTestUser("b");
    seedAdmin = await createTestUser("adm");
    await admin.from("platform_roles").insert({ user_id: seedAdmin.id, role: "administrator" });
  });
  afterAll(async () => {
    for (const user of [a, b]) {
      const files = await admin.storage.from("studio-covers").list(user.id);
      const paths = (files.data ?? []).map((file) => `${user.id}/${file.name}`);
      if (paths.length > 0) await admin.storage.from("studio-covers").remove(paths);
    }
    await cleanupTestUsers();
  });

  it("denies visitors every table and function", async () => {
    const anon = anonClient();
    for (const table of [
      "studio_folders",
      "studio_documents",
      "studio_versions",
      "studio_daily_log",
    ]) {
      const res = await anon.from(table).select("*");
      expect(res.error).not.toBeNull();
    }
    const save = await anon.rpc("studio_save_document", {
      p_id: randomUUID(),
      p_title: "x",
      p_content: content("x"),
      p_word_count: 1,
      p_base_version: 0,
    });
    expect(save.error).not.toBeNull();
  });

  it("creates a document and bumps the version on each save", async () => {
    const first = await rpcSave(a, { id: docA, text: "satu dua", words: 2 });
    expect(first.error).toBeNull();
    expect(first.data.ok).toBe(true);
    expect(first.data.doc.version).toBe(1);
    expect(first.data.progress.docs[docA].words).toBe(2);

    const second = await rpcSave(a, { id: docA, base: 1, text: "satu dua tiga", words: 3 });
    expect(second.data.doc.version).toBe(2);
    expect(second.data.progress.docs[docA].words).toBe(3);
  });

  it("returns a conflict instead of overwriting a stale save", async () => {
    const stale = await rpcSave(a, { id: docA, base: 1, text: "basi", words: 1 });
    expect(stale.error).toBeNull();
    expect(stale.data.ok).toBe(false);
    expect(stale.data.conflict.version).toBe(2);
    const stored = await a.client
      .from("studio_documents")
      .select("content")
      .eq("id", docA)
      .single();
    expect(JSON.stringify(stored.data?.content)).toContain("satu dua tiga");
  });

  it("lets only one of two simultaneous saves win", async () => {
    const id = randomUUID();
    await rpcSave(a, { id, text: "awal" });
    const [x, y] = await Promise.all([
      rpcSave(a, { id, base: 1, text: "dari x" }),
      rpcSave(a, { id, base: 1, text: "dari y" }),
    ]);
    expect([x.data.ok, y.data.ok].sort()).toEqual([false, true]);
  });

  it("keeps documents private to the owner, even from an Administrator", async () => {
    for (const user of [b, seedAdmin]) {
      const read = await user.client.from("studio_documents").select("id").eq("id", docA);
      expect(read.data).toEqual([]);
    }
    const take = await rpcSave(b, { id: docA, base: 2, text: "curian" });
    expect(take.error).not.toBeNull();
    const meta = await b.client.rpc("studio_update_meta", { p_id: docA, p_patch: { title: "x" } });
    expect(meta.data).toBeNull();
    const del = await b.client.from("studio_documents").delete().eq("id", docA);
    expect(del.error).toBeNull();
    const still = await a.client.from("studio_documents").select("id").eq("id", docA);
    expect(still.data).toHaveLength(1);
  });

  it("does not let clients write the tables directly", async () => {
    const insert = await a.client.from("studio_documents").insert({
      id: randomUUID(),
      owner_id: a.id,
      content: content("langsung"),
    });
    expect(insert.error).not.toBeNull();
    const update = await a.client.from("studio_documents").update({ version: 99 }).eq("id", docA);
    expect(update.error).not.toBeNull();
    const log = await a.client.from("studio_daily_log").insert({ owner_id: a.id, day: today() });
    expect(log.error).not.toBeNull();
    const version = await a.client.from("studio_versions").insert({
      id: `${docA}:v9`,
      doc_id: docA,
      owner_id: a.id,
      saved_at: new Date().toISOString(),
      content: content("x"),
      reason: "berkala",
    });
    expect(version.error).not.toBeNull();
  });

  it("rejects oversized or malformed input", async () => {
    const big = await a.client.rpc("studio_save_document", {
      p_id: randomUUID(),
      p_title: "besar",
      p_content: content("x".repeat(2_200_000)),
      p_word_count: 1,
      p_base_version: 0,
    });
    expect(big.error).not.toBeNull();
    const farDay = await rpcSave(a, { id: randomUUID(), day: "2020-01-01" });
    expect(farDay.error).not.toBeNull();
  });

  it("adds activity to the day instead of replacing it, and merges documents of one day", async () => {
    const day = today();
    const other = randomUUID();
    await rpcSave(a, { id: other, words: 10, activity: { added: 10, hour: 9, reduced: 0 } });
    const again = await rpcSave(a, {
      id: other,
      base: 1,
      words: 4,
      activity: { added: 0, hour: 9, reduced: 6 },
    });
    expect(again.data.progress.activity.wordsReduced).toBeGreaterThanOrEqual(6);
    const log = await a.client
      .from("studio_daily_log")
      .select("docs, activity")
      .eq("day", day)
      .single();
    expect(Object.keys(log.data?.docs ?? {})).toEqual(expect.arrayContaining([docA, other]));
    expect(log.data?.activity.wordsAddedByHour["9"]).toBeGreaterThanOrEqual(10);
    const asB = await b.client.from("studio_daily_log").select("*");
    expect(asB.data).toEqual([]);
  });

  it("keeps versions, prunes old ones, and only for the owner", async () => {
    const id = randomUUID();
    const now = Date.now();
    const version = (n: number, savedAt: number) => ({
      id: `${id}:v${n}`,
      savedAt,
      title: "t",
      content: content(`v${n}`),
      wordCount: 1,
      reason: "berkala",
    });
    const res = await rpcSave(a, {
      id,
      versions: [version(1, now), version(2, now - 4 * 24 * 60 * 60_000)],
    });
    expect(res.error).toBeNull();
    const kept = await a.client.from("studio_versions").select("id").eq("doc_id", id);
    expect(kept.data?.map((v) => v.id)).toEqual([`${id}:v1`]);
    const spy = await b.client.from("studio_versions").select("id").eq("doc_id", id);
    expect(spy.data).toEqual([]);
    const foreign = await b.client.rpc("studio_add_version", {
      p_version: { ...version(3, now), docId: id },
    });
    expect(foreign.error).not.toBeNull();
    const mismatched = await a.client.rpc("studio_add_version", {
      p_version: { ...version(1, now), id: `${randomUUID()}:v1`, docId: id },
    });
    expect(mismatched.error).not.toBeNull();
  });

  it("archives, restores and classifies without touching the version", async () => {
    const id = randomUUID();
    await rpcSave(a, { id });
    const archived = await a.client.rpc("studio_set_archived", { p_id: id, p_archived: true });
    expect(archived.data.version).toBe(1);
    expect(archived.data.archived_at).not.toBeNull();
    const again = await a.client.rpc("studio_set_archived", { p_id: id, p_archived: true });
    expect(again.data).toBeNull();
    const meta = await a.client.rpc("studio_update_meta", { p_id: id, p_patch: { title: "x" } });
    expect(meta.data).toBeNull();
    await a.client.rpc("studio_set_archived", { p_id: id, p_archived: false });

    const saved = await a.client.rpc("studio_update_classification", {
      p_id: id,
      p_expected_kind: null,
      p_expected_tags: null,
      p_kind: "cerpen",
      p_tags: ["pesisir"],
    });
    expect(saved.data.status).toBe("saved");
    expect(saved.data.doc.version).toBe(1);
    const stale = await a.client.rpc("studio_update_classification", {
      p_id: id,
      p_expected_kind: null,
      p_expected_tags: null,
      p_kind: "puisi",
      p_tags: [],
    });
    expect(stale.data.status).toBe("conflict");
    const invalid = await a.client.rpc("studio_update_classification", {
      p_id: id,
      p_expected_kind: "cerpen",
      p_expected_tags: ["pesisir"],
      p_kind: "bukan-jenis",
      p_tags: [],
    });
    expect(invalid.data.status).toBe("invalid");
  });

  it("trashes with updateMeta, deletes only from the trash, and takes versions along", async () => {
    const id = randomUUID();
    await rpcSave(a, {
      id,
      versions: [
        {
          id: `${id}:v1`,
          savedAt: Date.now(),
          title: "t",
          content: content("v"),
          wordCount: 1,
          reason: "berkala",
        },
      ],
    });
    const early = await a.client.from("studio_documents").delete().eq("id", id).select();
    expect(early.data).toEqual([]);
    const trashed = await a.client.rpc("studio_update_meta", {
      p_id: id,
      p_patch: { deletedAt: Date.now() },
    });
    expect(trashed.data.deleted_at).not.toBeNull();
    const gone = await a.client.from("studio_documents").delete().eq("id", id).select();
    expect(gone.data).toHaveLength(1);
    const versions = await admin.from("studio_versions").select("id").eq("doc_id", id);
    expect(versions.data).toEqual([]);
  });

  it("files documents and books only in the owner's own folders", async () => {
    const folder = await a.client
      .from("studio_folders")
      .insert({ name: "Buku", kind: "book", genre: "novel", tags: ["a"] })
      .select()
      .single();
    expect(folder.error).toBeNull();
    expect(folder.data?.owner_id).toBe(a.id);

    const id = randomUUID();
    const filed = await rpcSave(a, { id, folder: folder.data?.id });
    expect(filed.data.doc.folder_id).toBe(folder.data?.id);
    const foreign = await rpcSave(b, { id: randomUUID(), folder: folder.data?.id });
    expect(foreign.error).not.toBeNull();

    const spy = await b.client.from("studio_folders").select("id").eq("id", folder.data?.id);
    expect(spy.data).toEqual([]);
    const rename = await b.client
      .from("studio_folders")
      .update({ name: "Dicuri" })
      .eq("id", folder.data?.id)
      .select();
    expect(rename.data).toEqual([]);
    const forged = await b.client.from("studio_folders").insert({ owner_id: a.id, name: "palsu" });
    expect(forged.error).not.toBeNull();
    const badTags = await a.client
      .from("studio_folders")
      .insert({ name: "x", tags: Array(6).fill("t") });
    expect(badTags.error).not.toBeNull();
  });

  it("duplicates only active documents and copies without targets", async () => {
    const id = randomUUID();
    await rpcSave(a, { id, text: "salin aku" });
    const copy = await a.client.rpc("studio_duplicate_active", {
      p_source: id,
      p_new_id: randomUUID(),
      p_title: "Judul (salinan)",
    });
    expect(copy.data.version).toBe(1);
    expect(copy.data.targets).toBeNull();
    const foreign = await b.client.rpc("studio_duplicate_active", {
      p_source: id,
      p_new_id: randomUUID(),
      p_title: "x",
    });
    expect(foreign.data).toBeNull();
  });

  it("imports a local document once and never overwrites", async () => {
    const id = randomUUID();
    const doc = {
      id,
      title: "Dari perangkat",
      content: content("lama"),
      wordCount: 1,
      version: 7,
      updatedAt: 1_700_000_000_000,
      createdAt: 1_690_000_000_000,
      folderId: randomUUID(), // not in the account: filed at top level
      tags: ["x"],
    };
    const first = await a.client.rpc("studio_import_document", { p_doc: doc });
    expect(first.data).toBe(true);
    const stored = await a.client.from("studio_documents").select("*").eq("id", id).single();
    expect(stored.data?.version).toBe(7);
    expect(stored.data?.folder_id).toBeNull();
    const second = await a.client.rpc("studio_import_document", {
      p_doc: { ...doc, title: "Timpa" },
    });
    expect(second.data).toBe(false);
    const stolen = await b.client.rpc("studio_import_document", { p_doc: doc });
    expect(stolen.data).toBe(false);
    const history = await a.client.rpc("studio_import_history", {
      p_logs: [{ day: "2026-01-02", docs: { [id]: { title: "x", words: 5 } } }],
    });
    expect(history.data).toBe(1);
  });

  it("keeps cover images in a private bucket per user", async () => {
    const bucket = await admin.storage.getBucket("studio-covers");
    expect(bucket.data?.public).toBe(false);
    expect(bucket.data?.file_size_limit).toBe(2097152);

    const path = `${a.id}/cover-1.webp`;
    const up = await a.client.storage
      .from("studio-covers")
      .upload(path, PNG, { contentType: "image/png", upsert: true });
    expect(up.error).toBeNull();
    const own = await a.client.storage.from("studio-covers").download(path);
    expect(own.error).toBeNull();
    const other = await b.client.storage.from("studio-covers").download(path);
    expect(other.error).not.toBeNull();
    const intoOther = await b.client.storage
      .from("studio-covers")
      .upload(`${a.id}/b.webp`, PNG, { contentType: "image/png" });
    expect(intoOther.error).not.toBeNull();
    const publicUrl = anonClient().storage.from("studio-covers").getPublicUrl(path).data.publicUrl;
    expect((await fetch(publicUrl)).status).not.toBe(200);
  });
});
