import { describe, expect, it } from "vitest";
import { AUTH_ART, artFor } from "@/features/account/auth-art";

describe("artFor", () => {
  it("opens sign in and sign up on the welcome paper", () => {
    expect(artFor("/masuk")).toBe("welcome");
    expect(artFor("/daftar")).toBe("welcome");
  });

  it("opens recovery, verification and onboarding on the other paper", () => {
    for (const path of ["/lupa-sandi", "/atur-ulang-sandi", "/verifikasi", "/mulai", ""]) {
      expect(artFor(path)).toBe("recover");
    }
  });

  it("points at the files kept in public/auth", () => {
    expect(AUTH_ART.welcome.src).toBe("/auth/endpaper-1869.webp");
    expect(AUTH_ART.recover.src).toBe("/auth/endpaper-1880.webp");
  });
});
