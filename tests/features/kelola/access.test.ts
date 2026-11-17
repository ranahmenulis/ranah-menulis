import { describe, expect, it } from "vitest";
import { areaOf, areasFor, canAccess } from "@/features/kelola/access";

describe("management access", () => {
  it("gives a role only its own area", () => {
    expect(canAccess(["editor"], "editor")).toBe(true);
    expect(canAccess(["editor"], "juri")).toBe(false);
    expect(canAccess(["editor"], "admin")).toBe(false);
    expect(canAccess(["mentor"], "organizer")).toBe(false);
  });

  it("lets a person who holds several roles open each of their areas", () => {
    expect(areasFor(["editor", "juri"]).map((a) => a.id)).toEqual(["editor", "juri"]);
  });

  it("gives Administrator and Super Admin every area [usulan]", () => {
    for (const role of ["administrator", "super-admin"] as const) {
      expect(areasFor([role]).map((a) => a.id)).toHaveLength(5);
      expect(canAccess([role], "admin")).toBe(true);
    }
  });

  it("gives nobody without a role any area", () => {
    expect(areasFor([])).toEqual([]);
    expect(canAccess([], "admin")).toBe(false);
  });

  it("finds the area of a path, and none for the overview or unknown paths", () => {
    expect(areaOf("/kelola/editor")?.id).toBe("editor");
    expect(areaOf("/kelola/admin/pengguna")?.id).toBe("admin");
    expect(areaOf("/kelola")).toBeNull();
    expect(areaOf("/kelola/lain")).toBeNull();
  });
});
