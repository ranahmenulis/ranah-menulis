import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/sha256";

describe("sha256Hex", () => {
  it("matches the published test vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("agrees with Node on text around the block boundaries", () => {
    for (const length of [55, 56, 57, 63, 64, 65, 119, 120, 1000]) {
      const text = "a".repeat(length);
      expect(sha256Hex(text)).toBe(createHash("sha256").update(text).digest("hex"));
    }
  });

  it("hashes non-ASCII text by its UTF-8 bytes", () => {
    const text = "Hujan pertama bulan November — café 🌧️ 雨";
    expect(sha256Hex(text)).toBe(createHash("sha256").update(text, "utf8").digest("hex"));
  });
});

describe("sha256Bytes", () => {
  it("agrees with Node on raw bytes, including bytes that are not text", async () => {
    const { sha256Bytes } = await import("@/lib/sha256");
    const bytes = Uint8Array.from({ length: 1000 }, (_, i) => (i * 37) % 256);
    expect(sha256Bytes(bytes)).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(sha256Bytes(new Uint8Array())).toBe(sha256Hex(""));
  });
});
