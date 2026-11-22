import { describe, expect, it } from "vitest";
import { community as en } from "@/features/community/copy/shared-en";
import { postLabel } from "@/features/community/post-model";

describe("postLabel in English", () => {
  it("translates kind and genre", () => {
    expect(postLabel({ kind: "prolog", genre: "Cerpen" }, en.labels)).toBe(
      "Prologue · Short story",
    );
    expect(postLabel({ kind: "cuplikan", genre: "Puisi" }, en.labels)).toBe("Excerpt · Poetry");
  });
});
