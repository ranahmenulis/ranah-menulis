import { describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT } from "@/features/studio/document-layout";
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
    const tight = await buildPdf("", long, DEFAULT_PDF_OPTIONS, {
      ...DEFAULT_LAYOUT,
      lineSpacing: 1.15,
    });
    const wide = await buildPdf("", long, DEFAULT_PDF_OPTIONS, {
      ...DEFAULT_LAYOUT,
      lineSpacing: 2,
    });
    expect(await pageCount(tight)).toBeGreaterThan(1);
    expect(await pageCount(wide)).toBeGreaterThan(await pageCount(tight));
  });

  it("uses A5 paper", async () => {
    const blob = await buildPdf(
      "",
      { type: "doc", content: [paragraph("Halo")] },
      DEFAULT_PDF_OPTIONS,
    );
    const text = new TextDecoder("latin1").decode(await blob.arrayBuffer());
    const box = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(text);
    expect(box).not.toBeNull();
    // A5 is 148 x 210 mm, which is about 419.5 x 595.3 points.
    expect(Number(box![1])).toBeCloseTo(419.53, 0);
    expect(Number(box![2])).toBeCloseTo(595.28, 0);
  });

  it("fits more text on a page with smaller margins and a smaller size", async () => {
    const long = {
      type: "doc",
      content: Array.from({ length: 40 }, (_, i) => paragraph(`Paragraf ${i} `.repeat(30))),
    };
    const roomy = await buildPdf("", long, DEFAULT_PDF_OPTIONS, {
      ...DEFAULT_LAYOUT,
      marginMm: 40,
    });
    const snug = await buildPdf("", long, DEFAULT_PDF_OPTIONS, {
      ...DEFAULT_LAYOUT,
      marginMm: 10,
      sizePt: 10,
    });
    expect(await pageCount(roomy)).toBeGreaterThan(await pageCount(snug));
  });

  it("draws every font and alignment without failing", async () => {
    const body = {
      type: "doc",
      content: (["left", "center", "right", "justify"] as const).map((textAlign) => ({
        type: "paragraph",
        attrs: { textAlign },
        content: [
          {
            type: "text",
            text: "Kalimat yang cukup panjang agar terbagi ke beberapa baris. ".repeat(6),
          },
        ],
      })),
    };
    for (const font of ["times", "sans", "serif"] as const) {
      const blob = await buildPdf("Judul", body, DEFAULT_PDF_OPTIONS, { ...DEFAULT_LAYOUT, font });
      expect(blob.size).toBeGreaterThan(500);
    }
  });
});
