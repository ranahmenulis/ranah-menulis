import { describe, expect, it } from "vitest";
import { fitWithin } from "@/lib/files/image-fit";

describe("fitWithin", () => {
  it("never scales an image up", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales the longest side down to the limit and keeps the ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("keeps at least one pixel on a very thin image", () => {
    expect(fitWithin(16000, 1, 1600)).toEqual({ width: 1600, height: 1 });
  });
});
