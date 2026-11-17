import { describe, expect, it } from "vitest";
import { buildPdf, DEFAULT_PDF_OPTIONS } from "@/features/studio/export/export-pdf";

const paragraph = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });

async function pageCount(blob: Blob): Promise<number> {
  const text = new TextDecoder("latin1").decode(await blob.arrayBuffer());
  return (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

describe("buildPdf", () => {
  it("makes a real PDF file", async () => {
    const blob = await buildPdf(
      "Arutala",
      { type: "doc", content: [paragraph("Halo dunia")] },
      DEFAULT_PDF_OPTIONS,
    );
    expect(blob.type).toBe("application/pdf");
    const head = new TextDecoder().decode((await blob.arrayBuffer()).slice(0, 5));
    expect(head).toBe("%PDF-");
  });

  it("starts the text on page two when the title has its own page", async () => {
    const body = { type: "doc", content: [paragraph("Isi")] };
    const plain = await buildPdf("Arutala", body, { ...DEFAULT_PDF_OPTIONS, titlePage: false });
    const cover = await buildPdf("Arutala", body, { ...DEFAULT_PDF_OPTIONS, titlePage: true });
    expect(await pageCount(plain)).toBe(1);
    expect(await pageCount(cover)).toBe(2);
  });

  it("adds pages for a long text, more with wider line spacing", async () => {
    const long = {
      type: "doc",
      content: Array.from({ length: 60 }, (_, i) => paragraph(`Paragraf ${i} `.repeat(40))),
    };
    const tight = await buildPdf("", long, { ...DEFAULT_PDF_OPTIONS, lineSpacing: 1.15 });
    const wide = await buildPdf("", long, { ...DEFAULT_PDF_OPTIONS, lineSpacing: 2 });
    expect(await pageCount(tight)).toBeGreaterThan(1);
    expect(await pageCount(wide)).toBeGreaterThan(await pageCount(tight));
  });
});
