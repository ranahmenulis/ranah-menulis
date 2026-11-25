import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

describe("RLS: platform roles and audit log", () => {
  let a: TestUser;
  let b: TestUser;
  let boss: TestUser;

  beforeAll(async () => {
    a = await createTestUser("a");
    b = await createTestUser("b");
    boss = await createTestUser("boss");
    // The first Super Admin is always set up by the service role, never by a client.
    const seeded = await admin
      .from("platform_roles")
      .insert({ user_id: boss.id, role: "super_admin" });
    expect(seeded.error).toBeNull();
  });
  afterAll(cleanupTestUsers);

  it("does not let a user give themselves a role", async () => {
    const res = await a.client
      .from("platform_roles")
      .insert({ user_id: a.id, role: "super_admin" });
    expect(res.error).not.toBeNull();
    const rows = await admin.from("platform_roles").select("role").eq("user_id", a.id);
    expect(rows.data).toHaveLength(0);
  });

  it("does not let a non-Super Admin call grant_platform_role", async () => {
    const res = await a.client.rpc("grant_platform_role", { target: a.id, r: "administrator" });
    expect(res.error?.code).toBe("42501");
  });

  it("does not let anonymous visitors read roles or call the role functions", async () => {
    const anon = anonClient();
    const read = await anon.from("platform_roles").select("*");
    expect(read.error).not.toBeNull();
    const call = await anon.rpc("grant_platform_role", { target: a.id, r: "administrator" });
    expect(call.error).not.toBeNull();
  });

  it("shows users only their own roles", async () => {
    const mine = await a.client.from("platform_roles").select("user_id");
    expect(mine.data ?? []).toHaveLength(0);
    const bosses = await boss.client.from("platform_roles").select("user_id");
    expect((bosses.data ?? []).some((row) => row.user_id === boss.id)).toBe(true);
  });

  it("keeps the audit log closed to non-admins and to writes", async () => {
    const read = await a.client.from("audit_log").select("id");
    expect(read.data ?? []).toHaveLength(0);
    const insert = await a.client.from("audit_log").insert({ action: "forged" });
    expect(insert.error).not.toBeNull();
    const update = await boss.client.from("audit_log").update({ action: "edited" }).gt("id", 0);
    expect(update.error).not.toBeNull();
    const del = await boss.client.from("audit_log").delete().gt("id", 0);
    expect(del.error).not.toBeNull();
    const anon = await anonClient().from("audit_log").select("id");
    expect(anon.error).not.toBeNull();
  });

  it("lets a Super Admin grant a role, records it, and lets the user see it", async () => {
    const res = await boss.client.rpc("grant_platform_role", { target: b.id, r: "administrator" });
    expect(res.error).toBeNull();
    const mine = await b.client.from("platform_roles").select("role").eq("user_id", b.id);
    expect(mine.data).toEqual([{ role: "administrator" }]);
    // Administrators may see every user's roles (policy platform_roles_select: own row or is_admin).
    const everyone = await b.client.from("platform_roles").select("user_id");
    expect((everyone.data ?? []).some((row) => row.user_id === boss.id)).toBe(true);
    const log = await boss.client
      .from("audit_log")
      .select("action, target_id")
      .eq("target_id", b.id);
    expect(log.data).toEqual([{ action: "role.grant", target_id: b.id }]);
  });

  it("lets an Administrator read the audit log but not grant roles", async () => {
    const read = await b.client.from("audit_log").select("id").eq("target_id", b.id);
    expect(read.data?.length).toBeGreaterThan(0);
    const grant = await b.client.rpc("grant_platform_role", { target: a.id, r: "administrator" });
    expect(grant.error?.code).toBe("42501");
  });

  it("lets a Super Admin revoke a role", async () => {
    const res = await boss.client.rpc("revoke_platform_role", { target: b.id, r: "administrator" });
    expect(res.error).toBeNull();
    const left = await admin.from("platform_roles").select("role").eq("user_id", b.id);
    expect(left.data).toHaveLength(0);
  });

  it("does not let the last Super Admin be revoked", async () => {
    const others = await admin.from("platform_roles").select("user_id").eq("role", "super_admin");
    // Only meaningful while the test user is the sole Super Admin of the project.
    if ((others.data ?? []).length !== 1) return;
    const res = await boss.client.rpc("revoke_platform_role", {
      target: boss.id,
      r: "super_admin",
    });
    expect(res.error?.code).toBe("23514");
  });
});
