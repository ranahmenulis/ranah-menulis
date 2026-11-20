import { describe, expect, it } from "vitest";
import { MASONRY_GAP, MASONRY_ROW, rowSpan } from "@/features/community/hooks/use-row-span";

describe("rowSpan", () => {
  it("covers the tile and its gap in whole row tracks", () => {
    expect(rowSpan(0)).toBe(MASONRY_GAP / MASONRY_ROW);
    expect(rowSpan(200)).toBe(Math.ceil((200 + MASONRY_GAP) / MASONRY_ROW));
    expect(rowSpan(201) * MASONRY_ROW).toBeGreaterThanOrEqual(201 + MASONRY_GAP);
  });
});
