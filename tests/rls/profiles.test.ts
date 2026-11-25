import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

describe("RLS: profiles", () => {
  let a: TestUser;
  let b: TestUser;

  beforeAll(async () => {
    a = await createTestUser("a");
    b = await createTestUser("b");
  });
  afterAll(cleanupTestUsers);

  it("creates a profile for every new account and no platform role", async () => {
    const profile = await admin.from("profiles").select("id").eq("id", a.id);
    expect(profile.data).toHaveLength(1);
    const roles = await admin.from("platform_roles").select("role").eq("user_id", a.id);
    expect(roles.data).toHaveLength(0);
  });

  it("lets anyone read profiles (public profile)", async () => {
    const seen = await anonClient().from("profiles").select("id").eq("id", b.id);
    expect(seen.error).toBeNull();
    expect(seen.data).toHaveLength(1);
  });

  it("lets a user edit their own profile", async () => {
    const res = await a.client.from("profiles").update({ bio: "bio A" }).eq("id", a.id).select();
    expect(res.error).toBeNull();
    expect(res.data).toHaveLength(1);
  });

  it("does not let user A edit user B's profile", async () => {
    const res = await a.client.from("profiles").update({ bio: "hijacked" }).eq("id", b.id).select();
    expect(res.data ?? []).toHaveLength(0);
    const after = await admin.from("profiles").select("bio").eq("id", b.id).single();
    expect(after.data?.bio).not.toBe("hijacked");
  });

  it("does not let a user move their profile to another id", async () => {
    const res = await a.client.from("profiles").update({ id: b.id }).eq("id", a.id).select();
    expect(res.data ?? []).toHaveLength(0);
  });

  it("does not let anonymous visitors edit profiles", async () => {
    const res = await anonClient().from("profiles").update({ bio: "anon" }).eq("id", b.id).select();
    expect(res.data ?? []).toHaveLength(0);
  });

  it("does not let clients insert or delete profiles", async () => {
    const insert = await a.client.from("profiles").insert({ id: crypto.randomUUID() });
    expect(insert.error).not.toBeNull();
    const del = await a.client.from("profiles").delete().eq("id", b.id).select();
    expect(del.data ?? []).toHaveLength(0);
    const still = await admin.from("profiles").select("id").eq("id", b.id);
    expect(still.data).toHaveLength(1);
  });

  it("enforces the profile constraints", async () => {
    const badName = await a.client
      .from("profiles")
      .update({ username: "Bad Name!" })
      .eq("id", a.id);
    expect(badName.error).not.toBeNull();
    const badCountry = await a.client.from("profiles").update({ country: "US" }).eq("id", a.id);
    expect(badCountry.error).not.toBeNull();
  });
});
