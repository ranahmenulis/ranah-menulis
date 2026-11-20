import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANDING_IMAGES } from "@/features/landing/assets";
import { landing as en } from "@/features/landing/copy/en";
import { landing as id } from "@/features/landing/copy/id";

describe("landing images", () => {
  it("point at files that exist, with real dimensions", () => {
    for (const [name, image] of Object.entries(LANDING_IMAGES)) {
      expect(existsSync(join(process.cwd(), "public", image.src)), name).toBe(true);
      expect(image.src.endsWith(".webp"), name).toBe(true);
      expect(image.width, name).toBeGreaterThan(0);
      expect(image.height, name).toBeGreaterThan(0);
    }
  });

  it("have alt text in both languages for the plates that carry meaning", () => {
    for (const copy of [id, en]) {
      expect(copy.images.holbein.length).toBeGreaterThan(10);
      expect(copy.images.keladi.length).toBeGreaterThan(10);
    }
  });
});
