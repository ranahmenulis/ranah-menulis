import { describe, expect, it } from "vitest";
import {
  COVER_LINES,
  COVER_VARIANTS,
  coverOf,
  slugHash,
  titleInitial,
} from "@/features/projects/cover-model";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";

describe("slugHash", () => {
  it("is stable and differs between slugs", () => {
    expect(slugHash("antologi-a")).toBe(slugHash("antologi-a"));
    expect(slugHash("antologi-a")).not.toBe(slugHash("antologi-b"));
    expect(slugHash("")).toBeGreaterThan(0);
  });
});

describe("titleInitial", () => {
  it("skips quotes and punctuation", () => {
    expect(titleInitial("“Senja di Pesisir”")).toBe("S");
    expect(titleInitial("...ombak")).toBe("O");
    expect(titleInitial("2026: Antologi")).toBe("2");
  });

  it("falls back when the title has no letter", () => {
    expect(titleInitial("")).toBe("R");
    expect(titleInitial("— —")).toBe("R");
  });
});

describe("coverOf", () => {
  const project = { slug: "lomba-cerpen", category: "lomba" as const, title: "Lomba Cerpen" };

  it("follows the category and is the same on every call", () => {
    const cover = coverOf(project);
    expect(cover.pattern).toBe("lomba");
    expect(cover.mark).toBe("Lomba");
    expect(cover.initial).toBe("L");
    expect(coverOf(project)).toEqual(cover);
  });

  it("keeps the variant and the line lengths in range", () => {
    for (const slug of ["a", "b", "c", "d", "e", "f", "g"]) {
      const cover = coverOf({ ...project, slug });
      expect(cover.variant).toBeGreaterThanOrEqual(0);
      expect(cover.variant).toBeLessThan(COVER_VARIANTS);
      expect(cover.lines).toHaveLength(COVER_LINES);
      for (const line of cover.lines) {
        expect(line).toBeGreaterThanOrEqual(0.35);
        expect(line).toBeLessThanOrEqual(1);
      }
    }
  });

  it("gives the sample catalog both tones", () => {
    const tones = new Set(projectFixtures.map((p) => coverOf(p).tone));
    expect(tones).toEqual(new Set(["ink", "paper"]));
  });
});
