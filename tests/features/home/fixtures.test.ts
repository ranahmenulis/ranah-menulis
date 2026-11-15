import { describe, expect, it } from "vitest";
import { authors } from "@/features/community/fixtures/authors";
import { followed } from "@/features/home/fixtures";

describe("followed fixture", () => {
  it("links every author to a profile that exists, under the same name", () => {
    const withProfile = followed.filter((f) => f.handle);
    expect(withProfile.length).toBeGreaterThan(0);
    for (const f of withProfile) {
      expect(authors.find((a) => a.handle === f.handle)?.name).toBe(f.name);
    }
  });

  it("leaves groups without a link, since groups have no profile yet", () => {
    const groups = followed.filter((f) => !f.handle);
    expect(groups.map((g) => g.name)).toContain("Grup Penulis Pesisir");
  });
});
