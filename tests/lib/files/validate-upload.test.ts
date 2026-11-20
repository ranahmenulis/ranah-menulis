import { describe, expect, it } from "vitest";
import { FILE_MAX_BYTES, IMAGE_INPUT_MAX_BYTES } from "@/lib/files/limits";
import { validateUpload } from "@/lib/files/validate-upload";

const file = (content: BlobPart, name: string, type = "") => new File([content], name, { type });
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

describe("validateUpload", () => {
  it("accepts a real PNG as an image", async () => {
    expect(await validateUpload(file(PNG, "a.png", "image/png"), "image")).toEqual({
      ok: true,
      type: "image/png",
    });
  });

  it("checks the bytes, not the name or the reported type", async () => {
    const fake = file("<html></html>", "foto.png", "image/png");
    expect(await validateUpload(fake, "image")).toEqual({ ok: false, problem: "type" });
  });

  it("refuses a PDF where only images are allowed and the reverse for manuscripts", async () => {
    const pdf = file("%PDF-1.7 body", "a.pdf", "application/pdf");
    expect(await validateUpload(pdf, "image")).toEqual({ ok: false, problem: "type" });
    expect(await validateUpload(pdf, "manuscript")).toMatchObject({ ok: true });
    expect(await validateUpload(file(PNG, "a.png"), "manuscript")).toEqual({
      ok: false,
      problem: "type",
    });
  });

  it("accepts a DOCX and refuses any other ZIP", async () => {
    const docx = file("PK\u0003\u0004 word/document.xml", "naskah.docx");
    const zip = file("PK\u0003\u0004 something.txt", "naskah.docx");
    expect(await validateUpload(docx, "manuscript")).toMatchObject({ ok: true });
    expect(await validateUpload(zip, "manuscript")).toEqual({ ok: false, problem: "type" });
  });

  it("lets a preview be an image or a PDF", async () => {
    expect(await validateUpload(file(PNG, "a.png"), "preview")).toMatchObject({ ok: true });
    expect(await validateUpload(file("%PDF-1.4 x", "a.pdf"), "preview")).toMatchObject({
      ok: true,
    });
  });

  it("refuses an empty file and a file over the limit", async () => {
    expect(await validateUpload(file("", "a.pdf"), "manuscript")).toEqual({
      ok: false,
      problem: "empty",
    });
    const big = file(new Uint8Array(FILE_MAX_BYTES + 1), "a.pdf");
    expect(await validateUpload(big, "manuscript")).toEqual({ ok: false, problem: "size" });
    const bigImage = file(new Uint8Array(IMAGE_INPUT_MAX_BYTES + 1), "a.png");
    expect(await validateUpload(bigImage, "image")).toEqual({ ok: false, problem: "size" });
  });
});
