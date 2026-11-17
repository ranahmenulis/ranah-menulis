import { describe, expect, it } from "vitest";
import { exportFileName } from "@/features/studio/export/download";

describe("exportFileName", () => {
  it("keeps a normal title and adds the extension", () => {
    expect(exportFileName("Cerpen Arutala", "pdf")).toBe("Cerpen Arutala.pdf");
  });

  it("removes characters a file system refuses and collapses spaces", () => {
    expect(exportFileName('Bab 1: "Awal" / akhir?', "txt")).toBe("Bab 1 Awal akhir.txt");
  });

  it("falls back when there is no usable title", () => {
    expect(exportFileName("   ", "txt")).toBe("Tanpa judul.txt");
    expect(exportFileName("???", "pdf")).toBe("Tanpa judul.pdf");
    expect(exportFileName("...", "pdf")).toBe("Tanpa judul.pdf");
  });

  it("caps the length", () => {
    expect(exportFileName("a".repeat(200), "pdf").length).toBeLessThanOrEqual(84);
  });
});
