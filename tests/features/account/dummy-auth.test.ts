import { describe, expect, it } from "vitest";
import { simulateSignIn, simulateSignUp, usernameTaken } from "@/features/account/dummy-auth";

describe("dummy auth", () => {
  it("lets any address sign in except the two that show the failure states", () => {
    expect(simulateSignIn("rinjani@contoh.id")).toEqual({ ok: true });
    expect(simulateSignIn("SALAH@contoh.id")).toEqual({ ok: false, reason: "credentials" });
    expect(simulateSignIn(" belum@contoh.id ")).toEqual({ ok: false, reason: "unverified" });
  });

  it("refuses to sign up the one address that is already registered", () => {
    expect(simulateSignUp("baru@contoh.id")).toEqual({ ok: true });
    expect(simulateSignUp("Terdaftar@contoh.id")).toEqual({ ok: false, reason: "exists" });
  });

  it("treats the Community authors' usernames as taken, except your own", () => {
    expect(usernameTaken("hafizrahman")).toBe(true);
    expect(usernameTaken("namabaru")).toBe(false);
    expect(usernameTaken("rinjaniputri", "rinjaniputri")).toBe(false);
    expect(usernameTaken("rinjaniputri")).toBe(true);
  });
});
