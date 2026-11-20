import { describe, expect, it } from "vitest";
import { DOCX_TYPE, sniffType } from "@/lib/files/sniff";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

describe("sniffType", () => {
  it("recognises the allowed image types by their first bytes", () => {
    expect(sniffType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe(
      "image/webp",
    );
  });

  it("recognises a PDF", () => {
    expect(sniffType(text("%PDF-1.7\n"))).toBe("application/pdf");
  });

  it("accepts a ZIP only when it is a Word document", () => {
    expect(sniffType(text("PK\u0003\u0004....word/document.xml...."))).toBe(DOCX_TYPE);
    expect(sniffType(text("PK\u0003\u0004....xl/workbook.xml...."))).toBeNull();
  });

  it("refuses everything else, whatever the name says", () => {
    expect(sniffType(text("<script>alert(1)</script>"))).toBeNull();
    expect(sniffType(text("MZ\u0090\u0000"))).toBeNull();
    expect(sniffType(new Uint8Array())).toBeNull();
  });

  it("does not take a RIFF file that is not WebP for an image", () => {
    expect(sniffType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45))).toBeNull();
  });
});
