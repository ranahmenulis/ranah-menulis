import { beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({
  value: { url: "https://x.supabase.co/", publishableKey: "k" } as null | {
    url: string;
    publishableKey: string;
  },
}));
vi.mock("@/lib/env", () => ({ readSupabasePublicEnv: () => env.value }));

type Result = { data: unknown };
const db = vi.hoisted(() => ({
  claims: { data: { claims: { sub: "u1", email: "u1@contoh.id" } } } as { data: unknown },
  profile: { data: null } as Result,
  roles: { data: [] } as Result,
  fail: false,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    if (db.fail) throw new Error("boom");
    return {
      auth: { getClaims: async () => db.claims },
      from: (table: string) => ({
        select: () => ({
          eq: () =>
            table === "profiles"
              ? { maybeSingle: async () => db.profile }
              : Promise.resolve(db.roles),
        }),
      }),
    };
  },
}));

import { readSession } from "@/features/account/session";

const PROFILE = {
  id: "u1",
  username: "laras",
  display_name: "Laras",
  bio: null,
  avatar_path: null,
  country: "ID",
  timezone: "Asia/Jakarta",
  genres: [],
  prefs: {},
  onboarded_at: null,
  created_at: "2026-11-20T00:00:00.000Z",
  updated_at: "2026-11-20T00:00:00.000Z",
};

beforeEach(() => {
  env.value = { url: "https://x.supabase.co/", publishableKey: "k" };
  db.claims = { data: { claims: { sub: "u1", email: "u1@contoh.id" } } };
  db.profile = { data: PROFILE };
  db.roles = { data: [] };
  db.fail = false;
});

describe("readSession", () => {
  it("is a visitor when Supabase is not configured", async () => {
    env.value = null;
    expect((await readSession()).session.status).toBe("guest");
  });

  it("is a visitor without a verified session", async () => {
    db.claims = { data: null };
    const snapshot = await readSession();
    expect(snapshot).toMatchObject({ session: { status: "guest", userId: null }, account: null });
  });

  it("reads the account from the profile row and the email from the claims", async () => {
    const snapshot = await readSession();
    expect(snapshot.session).toMatchObject({ status: "user", userId: "u1", platformRoles: [] });
    expect(snapshot.account).toMatchObject({
      email: "u1@contoh.id",
      registered: true,
      profile: { name: "Laras", username: "laras" },
    });
  });

  it("names the platform roles the way the screens do", async () => {
    db.roles = { data: [{ role: "super_admin" }, { role: "administrator" }, { role: "other" }] };
    expect((await readSession()).session.platformRoles).toEqual(["super-admin", "administrator"]);
  });

  it("still signs the user in with an empty account when the profile row is missing", async () => {
    db.profile = { data: null };
    const snapshot = await readSession();
    expect(snapshot.session.status).toBe("user");
    expect(snapshot.account?.profile.name).toBe("");
    expect(snapshot.account?.email).toBe("u1@contoh.id");
  });

  it("falls back to a visitor when reading fails", async () => {
    db.fail = true;
    expect((await readSession()).session.status).toBe("guest");
  });
});
