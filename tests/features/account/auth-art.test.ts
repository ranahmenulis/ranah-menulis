import { describe, expect, it } from "vitest";
import { AUTH_SCENES, artFor } from "@/features/account/auth-art";

describe("AUTH_SCENES", () => {
  it("pairs every scene with a painting and an engraving, both from public/auth", () => {
    for (const scene of Object.values(AUTH_SCENES)) {
      expect(scene.painting.src).toMatch(/^\/auth\/.+\.webp$/);
      expect(scene.cutout.src).toMatch(/^\/auth\/.+\.webp$/);
    }
  });
});

describe("artFor", () => {
  it("opens sign in and sign up on the welcome line", () => {
    expect(artFor("/masuk")).toBe("welcome");
    expect(artFor("/daftar")).toBe("welcome");
  });

  it("opens recovery, verification and onboarding on the other line", () => {
    for (const path of ["/lupa-sandi", "/atur-ulang-sandi", "/verifikasi", "/mulai", ""]) {
      expect(artFor(path)).toBe("recover");
    }
  });
});
