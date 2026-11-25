import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

// A 1x1 transparent PNG: enough to exercise the bucket without a real photo.
const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  ),
  (char) => char.charCodeAt(0),
);

describe("RLS: avatars bucket", () => {
  let a: TestUser;
  let b: TestUser;

  beforeAll(async () => {
    a = await createTestUser("a");
    b = await createTestUser("b");
  });
  afterAll(cleanupTestUsers);

  it("is a public bucket limited to small images", async () => {
    const bucket = await admin.storage.getBucket("avatars");
    expect(bucket.data?.public).toBe(true);
    expect(bucket.data?.file_size_limit).toBe(262144);
    expect(bucket.data?.allowed_mime_types).toEqual(["image/webp", "image/jpeg", "image/png"]);
  });

  it("lets a user upload and replace a photo in their own folder", async () => {
    const path = `${a.id}/avatar.webp`;
    const first = await a.client.storage
      .from("avatars")
      .upload(path, PNG, { contentType: "image/png", upsert: true });
    expect(first.error).toBeNull();
    const again = await a.client.storage
      .from("avatars")
      .upload(path, PNG, { contentType: "image/png", upsert: true });
    expect(again.error).toBeNull();
  });

  it("serves the photo to anyone through its public address", async () => {
    const { data } = anonClient().storage.from("avatars").getPublicUrl(`${a.id}/avatar.webp`);
    const response = await fetch(data.publicUrl);
    expect(response.status).toBe(200);
  });

  it("does not let a user write into another user's folder", async () => {
    const res = await a.client.storage
      .from("avatars")
      .upload(`${b.id}/avatar.webp`, PNG, { contentType: "image/png", upsert: true });
    expect(res.error).not.toBeNull();
    const files = await admin.storage.from("avatars").list(b.id);
    expect(files.data ?? []).toHaveLength(0);
  });

  it("does not let anonymous visitors upload", async () => {
    const res = await anonClient()
      .storage.from("avatars")
      .upload(`${a.id}/anon.webp`, PNG, { contentType: "image/png" });
    expect(res.error).not.toBeNull();
  });

  it("rejects files that are not images", async () => {
    const res = await a.client.storage
      .from("avatars")
      .upload(`${a.id}/note.txt`, new Blob(["hello"]), { contentType: "text/plain" });
    expect(res.error).not.toBeNull();
  });

  it("rejects photos over the size limit", async () => {
    const big = new Uint8Array(262145);
    const res = await a.client.storage
      .from("avatars")
      .upload(`${a.id}/big.png`, big, { contentType: "image/png" });
    expect(res.error).not.toBeNull();
  });

  it("does not let a user delete another user's photo, but lets them delete their own", async () => {
    const theirs = await b.client.storage.from("avatars").remove([`${a.id}/avatar.webp`]);
    expect(theirs.data ?? []).toHaveLength(0);
    const still = await admin.storage.from("avatars").list(a.id);
    expect((still.data ?? []).some((file) => file.name === "avatar.webp")).toBe(true);
    const own = await a.client.storage.from("avatars").remove([`${a.id}/avatar.webp`]);
    expect(own.error).toBeNull();
    expect(own.data ?? []).toHaveLength(1);
  });
});
