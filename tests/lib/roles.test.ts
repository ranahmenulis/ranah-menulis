import { describe, expect, it } from "vitest";
import { isPlatformAdmin, parseRoles } from "@/lib/roles";

describe("parseRoles", () => {
  it("reads one role or several, in the order given", () => {
    expect(parseRoles("editor")).toEqual(["editor"]);
    expect(parseRoles("juri, editor")).toEqual(["juri", "editor"]);
  });

  it("ignores unknown words, repeats, case and empty input", () => {
    expect(parseRoles("Editor,editor,penguasa,")).toEqual(["editor"]);
    expect(parseRoles("tamu")).toEqual([]);
    expect(parseRoles("")).toEqual([]);
    expect(parseRoles(null)).toEqual([]);
  });

  it("returns the same empty list every time so memoised readers stay stable", () => {
    expect(parseRoles("")).toBe(parseRoles("nonsense"));
  });
});

describe("isPlatformAdmin", () => {
  it("is true for Administrator and Super Admin only", () => {
    expect(isPlatformAdmin(["administrator"])).toBe(true);
    expect(isPlatformAdmin(["super-admin"])).toBe(true);
    expect(isPlatformAdmin(["editor", "juri", "mentor", "organizer"])).toBe(false);
  });
});
