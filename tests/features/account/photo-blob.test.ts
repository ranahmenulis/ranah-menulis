import { describe, expect, it } from "vitest";
import { dataUrlToBlob } from "@/features/account/photo-blob";

describe("dataUrlToBlob", () => {
  it("turns a base64 image data URL into a Blob of that type", () => {
    const blob = dataUrlToBlob("data:image/webp;base64,AAEC");
    expect(blob?.type).toBe("image/webp");
    expect(blob?.size).toBe(3);
  });

  it.each([
    "data:text/plain;base64,AAEC",
    "data:image/svg+xml;base64,AAEC",
    "data:image/png,notbase64",
    "https://x.test/a.png",
    "",
  ])("refuses %j", (value) => {
    expect(dataUrlToBlob(value)).toBeNull();
  });

  it("refuses base64 that cannot be decoded", () => {
    expect(dataUrlToBlob("data:image/png;base64,A")).toBeNull();
  });
});
