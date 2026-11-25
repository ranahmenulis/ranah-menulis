import { beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({
  claims: { data: { claims: { sub: "u1" } } } as { data: unknown },
  signOut: vi.fn(),
  throws: false,
}));
const admin = vi.hoisted(() => ({
  list: vi.fn(),
  remove: vi.fn(),
  insert: vi.fn(),
  deleteUser: vi.fn(),
  buckets: [] as string[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    if (server.throws) throw new Error("boom");
    return { auth: { getClaims: async () => server.claims, signOut: server.signOut } };
  },
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    storage: {
      from: (bucket: string) => {
        admin.buckets.push(bucket);
        return { list: admin.list, remove: admin.remove };
      },
    },
    from: () => ({ insert: admin.insert }),
    auth: { admin: { deleteUser: admin.deleteUser } },
  }),
}));

import { deleteOwnAccount } from "@/features/account/delete-account";

beforeEach(() => {
  server.claims = { data: { claims: { sub: "u1" } } };
  server.throws = false;
  server.signOut.mockReset().mockResolvedValue({});
  admin.list.mockReset().mockResolvedValue({ data: [{ name: "avatar.webp" }] });
  admin.remove.mockReset().mockResolvedValue({});
  admin.insert.mockReset().mockResolvedValue({});
  admin.deleteUser.mockReset().mockResolvedValue({ error: null });
  admin.buckets.length = 0;
});

describe("deleteOwnAccount", () => {
  it("refuses without a verified session and touches nothing", async () => {
    server.claims = { data: null };
    expect(await deleteOwnAccount()).toEqual({ ok: false, reason: "unauthenticated" });
    expect(admin.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes the signed-in user's own account only, with no argument to steer it", async () => {
    expect(deleteOwnAccount.length).toBe(0);
    expect(await deleteOwnAccount()).toEqual({ ok: true });
    expect(admin.deleteUser).toHaveBeenCalledWith("u1");
  });

  it("removes the photo files, writes one audit line with only the id, then clears the session", async () => {
    await deleteOwnAccount();
    expect(admin.remove).toHaveBeenCalledWith(["u1/avatar.webp"]);
    expect(admin.insert).toHaveBeenCalledWith({
      actor_id: "u1",
      action: "account.delete",
      target_type: "user",
      target_id: "u1",
    });
    expect(server.signOut).toHaveBeenCalled();
  });

  it("also removes the person's Studio cover files", async () => {
    await deleteOwnAccount();
    expect(admin.buckets.filter((b, i, all) => all.indexOf(b) === i)).toEqual([
      "avatars",
      "studio-covers",
    ]);
  });

  it("does not look for photo files to remove when there are none", async () => {
    admin.list.mockResolvedValue({ data: [] });
    await deleteOwnAccount();
    expect(admin.remove).not.toHaveBeenCalled();
  });

  it("reports failure when the account could not be deleted, and keeps the session", async () => {
    admin.deleteUser.mockResolvedValue({ error: { message: "no" } });
    expect(await deleteOwnAccount()).toEqual({ ok: false, reason: "failed" });
    expect(server.signOut).not.toHaveBeenCalled();
  });

  it("reports failure when something throws", async () => {
    server.throws = true;
    expect(await deleteOwnAccount()).toEqual({ ok: false, reason: "failed" });
  });
});
