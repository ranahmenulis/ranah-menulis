import { describe, expect, it } from "vitest";
import { fileKindLabel, formatFileSize } from "@/lib/files/format-size";

describe("formatFileSize", () => {
  it("shows kilobytes below a megabyte", () => {
    expect(formatFileSize(840 * 1024)).toBe("840 KB");
  });

  it("uses a decimal comma in Indonesian and a point in English", () => {
    const bytes = 2.3 * 1024 * 1024;
    expect(formatFileSize(bytes, "id")).toBe("2,3 MB");
    expect(formatFileSize(bytes, "en")).toBe("2.3 MB");
  });
});

describe("fileKindLabel", () => {
  it("translates the generic labels and keeps format names", () => {
    expect(fileKindLabel("image/webp", "id")).toBe("Gambar");
    expect(fileKindLabel("image/webp", "en")).toBe("Image");
    expect(fileKindLabel("text/plain", "en")).toBe("File");
    expect(fileKindLabel("application/pdf", "en")).toBe("PDF");
  });
});
