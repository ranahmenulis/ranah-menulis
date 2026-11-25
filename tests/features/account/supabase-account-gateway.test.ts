import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  update: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  publicUrl: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ update: (row: unknown) => ({ eq: () => ({ select: () => db.update(row) }) }) }),
    storage: {
      from: () => ({
        upload: db.upload,
        remove: db.remove,
        getPublicUrl: db.publicUrl,
      }),
    },
  }),
}));

import { supabaseAccountGateway as gateway } from "@/features/account/supabase-account-gateway";

beforeEach(() => {
  Object.values(db).forEach((fn) => fn.mockReset());
  db.publicUrl.mockReturnValue({ data: { publicUrl: "https://x.supabase.co/p/avatar.webp" } });
});

describe("supabaseAccountGateway.updateProfile", () => {
  it("is ok when exactly the user's row was updated", async () => {
    db.update.mockResolvedValue({ data: [{ id: "u1" }], error: null });
    expect(await gateway.updateProfile("u1", { bio: "x" })).toBe("ok");
    expect(db.update).toHaveBeenCalledWith({ bio: "x" });
  });

  it("names a taken username (unique violation)", async () => {
    db.update.mockResolvedValue({ data: null, error: { code: "23505" } });
    expect(await gateway.updateProfile("u1", { username: "dipakai" })).toBe("username-taken");
  });

  it("fails for other errors, for no row updated, and for a throw", async () => {
    db.update.mockResolvedValue({ data: null, error: { code: "42501" } });
    expect(await gateway.updateProfile("u1", { bio: "x" })).toBe("failed");
    db.update.mockResolvedValue({ data: [], error: null });
    expect(await gateway.updateProfile("u1", { bio: "x" })).toBe("failed");
    db.update.mockRejectedValue(new Error("offline"));
    expect(await gateway.updateProfile("u1", { bio: "x" })).toBe("failed");
  });
});

describe("supabaseAccountGateway photo", () => {
  it("uploads into the user's own folder, replacing the old photo", async () => {
    db.upload.mockResolvedValue({ error: null });
    const result = await gateway.uploadPhoto("u1", "data:image/webp;base64,AAEC");
    expect(result).toEqual({
      ok: true,
      path: "u1/avatar.webp",
      url: "https://x.supabase.co/p/avatar.webp",
    });
    expect(db.upload.mock.calls[0]?.[0]).toBe("u1/avatar.webp");
    expect(db.upload.mock.calls[0]?.[2]).toMatchObject({ contentType: "image/webp", upsert: true });
  });

  it("fails without uploading for something that is not an image data URL", async () => {
    expect(await gateway.uploadPhoto("u1", "data:text/plain;base64,AAEC")).toEqual({ ok: false });
    expect(db.upload).not.toHaveBeenCalled();
  });

  it("fails when storage refuses", async () => {
    db.upload.mockResolvedValue({ error: { message: "too big" } });
    expect(await gateway.uploadPhoto("u1", "data:image/webp;base64,AAEC")).toEqual({ ok: false });
  });

  it("removes the photo and never throws", async () => {
    db.remove.mockRejectedValue(new Error("offline"));
    await expect(gateway.removePhoto("u1")).resolves.toBeUndefined();
    expect(db.remove).toHaveBeenCalledWith(["u1/avatar.webp"]);
  });
});
