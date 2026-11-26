import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { StoredFile } from "@/lib/files/file-store";
import { createSupabaseFileStore } from "@/lib/files/supabase-file-store";

function makeClient() {
  const objects = new Map<string, Blob>();
  const upload = vi.fn(async (path: string, blob: Blob) => {
    objects.set(path, blob);
    return { data: { path }, error: null };
  });
  const download = vi.fn(async (path: string) => {
    const blob = objects.get(path);
    return blob ? { data: blob, error: null } : { data: null, error: { message: "not found" } };
  });
  const remove = vi.fn(async (paths: string[]) => {
    for (const p of paths) objects.delete(p);
    return { data: [], error: null };
  });
  const client = {
    storage: { from: vi.fn(() => ({ upload, download, remove })) },
  } as unknown as SupabaseClient;
  return { client, upload, download, remove, objects };
}

const sampleFile = (id = "file-1"): StoredFile => ({
  id,
  name: "cover.webp",
  type: "image/webp",
  size: 4,
  blob: new Blob(["webp"], { type: "image/webp" }),
  createdAt: 1000,
});

describe("createSupabaseFileStore", () => {
  it("uploads to <ownerId>/<id> and caches the stored file", async () => {
    const { client, upload, download } = makeClient();
    const store = createSupabaseFileStore(client, "studio-covers", "user-1");
    const file = sampleFile();

    await store.put(file);
    expect(upload).toHaveBeenCalledWith("user-1/file-1", file.blob, {
      contentType: "image/webp",
      upsert: true,
    });

    const got = await store.get("file-1");
    expect(got).toBe(file);
    expect(download).not.toHaveBeenCalled();
  });

  it("downloads uncached files once and returns null when missing", async () => {
    const { client, download, objects } = makeClient();
    objects.set("user-1/cover-a", new Blob(["abc"], { type: "image/webp" }));
    const store = createSupabaseFileStore(client, "studio-covers", "user-1");

    const first = await store.get("cover-a");
    const second = await store.get("cover-a");
    expect(first?.id).toBe("cover-a");
    expect(first?.type).toBe("image/webp");
    expect(second).toBe(first);
    expect(download).toHaveBeenCalledTimes(1);

    expect(await store.get("missing")).toBeNull();
    expect(await store.get("")).toBeNull();
  });

  it("removes from cache and storage on delete", async () => {
    const { client, remove, download } = makeClient();
    const store = createSupabaseFileStore(client, "studio-covers", "user-1");
    await store.put(sampleFile("c1"));

    await store.delete("c1");
    expect(remove).toHaveBeenCalledWith(["user-1/c1"]);
    expect(await store.get("c1")).toBeNull();
    expect(download).toHaveBeenCalledWith("user-1/c1");
  });

  it("rejects path traversal file ids", async () => {
    const { client, upload, download, remove } = makeClient();
    const store = createSupabaseFileStore(client, "studio-covers", "user-1");

    await expect(store.put(sampleFile("../other/evil"))).rejects.toThrow("Invalid file id");
    expect(await store.get("../other/evil")).toBeNull();
    await store.delete("../other/evil");
    expect(upload).not.toHaveBeenCalled();
    expect(download).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
});
