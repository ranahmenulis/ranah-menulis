import { beforeEach, describe, expect, it, vi } from "vitest";

type AuthResult = {
  data?: unknown;
  error?: { code?: string; name: string; status?: number } | null;
};
const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));
const profile = vi.hoisted(() => ({
  data: { onboarded_at: null } as { onboarded_at: string | null } | null,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth,
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile.data }) }) }),
    }),
  }),
}));

import { supabaseAuthGateway as gateway } from "@/features/account/supabase-auth-gateway";

const reply = (result: AuthResult) => Promise.resolve({ data: {}, error: null, ...result });

beforeEach(() => {
  Object.values(auth).forEach((fn) => fn.mockReset());
  profile.data = { onboarded_at: null };
});

describe("supabaseAuthGateway.signIn", () => {
  it("reports whether the profile was finished", async () => {
    auth.signInWithPassword.mockReturnValue(reply({ data: { user: { id: "u1" } } }));
    expect(await gateway.signIn("a@b.id", "x")).toEqual({ ok: true, onboarded: false });
    profile.data = { onboarded_at: "2026-11-25T00:00:00Z" };
    expect(await gateway.signIn("a@b.id", "x")).toEqual({ ok: true, onboarded: true });
  });

  it.each([
    [{ code: "invalid_credentials", name: "AuthApiError" }, "credentials"],
    [{ code: "email_not_confirmed", name: "AuthApiError" }, "unverified"],
    [{ code: "over_request_rate_limit", name: "AuthApiError", status: 429 }, "limit"],
    [{ name: "AuthRetryableFetchError", status: 0 }, "network"],
  ] as const)("maps %j to %s", async (error, reason) => {
    auth.signInWithPassword.mockReturnValue(reply({ error }));
    expect(await gateway.signIn("a@b.id", "x")).toEqual({ ok: false, reason });
  });

  it("reads a thrown error as a network problem", async () => {
    auth.signInWithPassword.mockRejectedValue(new Error("offline"));
    expect(await gateway.signIn("a@b.id", "x")).toEqual({ ok: false, reason: "network" });
  });
});

describe("supabaseAuthGateway.signUp", () => {
  it("sends the email link to the callback, ending on the verified screen", async () => {
    auth.signUp.mockReturnValue(reply({ data: { user: { identities: [{}] }, session: null } }));
    await gateway.signUp("a@b.id", "rahasia123", "/projects");
    const redirect = new URL(auth.signUp.mock.calls[0][0].options.emailRedirectTo);
    expect(redirect.pathname).toBe("/auth/callback");
    expect(redirect.searchParams.get("next")).toBe(
      "/verifikasi?lanjut=%2Fprojects&status=berhasil",
    );
    expect(redirect.searchParams.get("fail")).toBe(
      "/verifikasi?lanjut=%2Fprojects&status=kedaluwarsa",
    );
  });

  it("says whether the user is already signed in", async () => {
    auth.signUp.mockReturnValue(reply({ data: { user: { identities: [{}] }, session: null } }));
    expect(await gateway.signUp("a@b.id", "rahasia123")).toEqual({ ok: true, verified: false });
    auth.signUp.mockReturnValue(reply({ data: { user: { identities: [{}] }, session: {} } }));
    expect(await gateway.signUp("a@b.id", "rahasia123")).toEqual({ ok: true, verified: true });
  });

  it("reads an answer without identities as an address that is already registered", async () => {
    auth.signUp.mockReturnValue(reply({ data: { user: { identities: [] }, session: null } }));
    expect(await gateway.signUp("a@b.id", "rahasia123")).toEqual({ ok: false, reason: "exists" });
  });

  it.each([
    [{ code: "user_already_exists", name: "AuthApiError" }, "exists"],
    [{ code: "weak_password", name: "AuthWeakPasswordError" }, "password"],
    [{ code: "over_email_send_rate_limit", name: "AuthApiError", status: 429 }, "limit"],
  ] as const)("maps %j to %s", async (error, reason) => {
    auth.signUp.mockReturnValue(reply({ error }));
    expect(await gateway.signUp("a@b.id", "x")).toEqual({ ok: false, reason });
  });
});

describe("supabaseAuthGateway, the rest", () => {
  it("asks for the verification email again with the same link", async () => {
    auth.resend.mockReturnValue(reply({}));
    expect(await gateway.resendVerification("a@b.id")).toEqual({ ok: true });
    expect(auth.resend.mock.calls[0][0]).toMatchObject({ type: "signup", email: "a@b.id" });
  });

  it("asks for the reset link, ending on the reset screen", async () => {
    auth.resetPasswordForEmail.mockReturnValue(reply({}));
    expect(await gateway.requestPasswordReset("a@b.id")).toEqual({ ok: true });
    const redirect = new URL(auth.resetPasswordForEmail.mock.calls[0][1].redirectTo);
    expect(redirect.searchParams.get("next")).toBe("/atur-ulang-sandi");
    expect(redirect.searchParams.get("fail")).toBe("/atur-ulang-sandi?status=kedaluwarsa");
  });

  it.each([
    [{ code: "same_password", name: "AuthApiError" }, "same"],
    [{ code: "weak_password", name: "AuthWeakPasswordError" }, "password"],
    [{ name: "AuthSessionMissingError" }, "expired"],
    [{ code: "over_request_rate_limit", name: "AuthApiError", status: 429 }, "limit"],
  ] as const)("maps a password change error %j to %s", async (error, reason) => {
    auth.updateUser.mockReturnValue(reply({ error }));
    expect(await gateway.updatePassword("rahasia123")).toEqual({ ok: false, reason });
  });

  it("signs out, and does not fail when it cannot reach the server", async () => {
    auth.signOut.mockRejectedValue(new Error("offline"));
    await expect(gateway.signOut()).resolves.toBeUndefined();
  });
});
