import { describe, expect, it } from "vitest";
import { authors } from "@/features/community/fixtures/authors";
import { followed } from "@/features/home/fixtures";

describe("followed fixture", () => {
  it("links every author to a profile that exists, under the same name", () => {
    expect(followed.length).toBeGreaterThan(0);
    for (const f of followed) {
      expect(authors.find((a) => a.handle === f.handle)?.name).toBe(f.name);
    }
  });
});
