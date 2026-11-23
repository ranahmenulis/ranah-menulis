import { describe, expect, it } from "vitest";
import { artFor } from "@/features/account/auth-art";

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
