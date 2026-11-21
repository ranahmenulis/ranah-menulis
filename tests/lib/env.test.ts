import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublicEnv, isDemoRolesEnabled, readSupabasePublicEnv } from "@/lib/env";

// The real module imports "server-only", which throws outside a React Server environment.
vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("readSupabasePublicEnv", () => {
  it("returns the url and publishable key when both are set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(readSupabasePublicEnv()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("returns null when either value is missing or empty", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(readSupabasePublicEnv()).toBeNull();
  });
});

describe("getSupabasePublicEnv", () => {
  it("throws an actionable error when not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => getSupabasePublicEnv()).toThrow(/\.env\.example/);
  });
});

describe("getSupabaseSecretKey", () => {
  it("returns the key when set and throws when missing", async () => {
    const { getSupabaseSecretKey } = await import("@/lib/env.server");

    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
    expect(getSupabaseSecretKey()).toBe("sb_secret_test");

    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(() => getSupabaseSecretKey()).toThrow(/SUPABASE_SECRET_KEY/);
  });
});

describe("isDemoRolesEnabled", () => {
  it("is on only when the switch is exactly 1", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_ROLES", "1");
    expect(isDemoRolesEnabled()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_DEMO_ROLES", "true");
    expect(isDemoRolesEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_DEMO_ROLES", "");
    expect(isDemoRolesEnabled()).toBe(false);
  });
});
