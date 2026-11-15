import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins class names with a single space", () => {
    expect(cn("px-4", "text-ink")).toBe("px-4 text-ink");
  });

  it("drops falsy values", () => {
    expect(cn("px-4", false, null, undefined, "text-ink")).toBe("px-4 text-ink");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
