import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, anonClient, cleanupTestUsers, createTestUser, type TestUser } from "./helpers";

describe("RLS: waitlist_signups", () => {
  let a: TestUser;
  const email = `rls-test-waitlist-${crypto.randomUUID().slice(0, 8)}@example.com`;

  beforeAll(async () => {
    a = await createTestUser("a");
  });
  afterAll(async () => {
    await admin.from("waitlist_signups").delete().ilike("email", "rls-test-%");
    await cleanupTestUsers();
  });

  it("is closed to anonymous visitors", async () => {
    const anon = anonClient();
    const insert = await anon
      .from("waitlist_signups")
      .insert({ name: "x", email: `anon-${email}`, country: "ID" });
    expect(insert.error).not.toBeNull();
    const read = await anon.from("waitlist_signups").select("id");
    expect(read.error).not.toBeNull();
  });

  it("is closed to signed-in users", async () => {
    const insert = await a.client
      .from("waitlist_signups")
      .insert({ name: "x", email: `user-${email}`, country: "ID" });
    expect(insert.error).not.toBeNull();
    const read = await a.client.from("waitlist_signups").select("id");
    expect(read.error).not.toBeNull();
  });

  it("is writable by the service role and keeps one row per email, case-insensitively", async () => {
    const first = await admin
      .from("waitlist_signups")
      .insert({ name: "Test", email, country: "ID" });
    expect(first.error).toBeNull();
    const again = await admin
      .from("waitlist_signups")
      .insert({ name: "Test", email: email.toUpperCase(), country: "MY" });
    expect(again.error?.code).toBe("23505");
  });
});
