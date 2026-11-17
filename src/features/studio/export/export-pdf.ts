import type { JSONContent } from "@tiptap/react";
import { exportBlocks, type ExportBlock } from "./export-blocks";

export type PdfOptions = {
  /** The title alone on the first page, before the text starts on page two. */
  titlePage: boolean;
  pageNumbers: boolean;
  /** Line height as a multiple of the font size. */
  lineSpacing: 1.15 | 1.5 | 2;
};

export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  titlePage: false,
  pageNumbers: true,
  lineSpacing: 1.5,
};

const PAGE = { width: 210, height: 297, margin: 25 }; // A4, millimetres
const BODY_PT = 12;
const PT_TO_MM = 25.4 / 72;

type Style = { size: number; font: "normal" | "bold" | "italic"; indent: number; gapAfter: number };

function styleOf(block: ExportBlock): Style {
  switch (block.kind) {
    case "heading":
      return { size: block.level === 1 ? 18 : 15, font: "bold", indent: 0, gapAfter: 0.8 };
    case "quote":
      return { size: BODY_PT, font: "italic", indent: 10, gapAfter: 0.8 };
    case "bullet":
    case "number":
      return { size: BODY_PT, font: "normal", indent: 6, gapAfter: 0.3 };
    default:
      return { size: BODY_PT, font: "normal", indent: 0, gapAfter: 0.8 };
  }
}

function labelOf(block: ExportBlock): string {
  if (block.kind === "bullet") return "•";
  if (block.kind === "number") return `${block.index}.`;
  return "";
}

/**
 * Builds the PDF in the browser (jsPDF is loaded only when someone exports). Standard PDF fonts
 * (Times) cover Indonesian and Malay; characters outside them may not draw. Returns the file.
 */
export async function buildPdf(
  title: string,
  content: JSONContent,
  options: PdfOptions,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const textWidth = PAGE.width - PAGE.margin * 2;
  const bottom = PAGE.height - PAGE.margin;
  let y = PAGE.margin;

  const heading = title.trim();
  if (options.titlePage && heading) {
    pdf.setFont("times", "bold").setFontSize(28);
    const lines = pdf.splitTextToSize(heading, textWidth) as string[];
    pdf.text(lines, PAGE.width / 2, PAGE.height / 2 - 20, { align: "center" });
    pdf.addPage();
  } else if (heading) {
    pdf.setFont("times", "bold").setFontSize(22);
    const lines = pdf.splitTextToSize(heading, textWidth) as string[];
    pdf.text(lines, PAGE.margin, y + 8);
    y += lines.length * 22 * PT_TO_MM * 1.2 + 10;
  }

  for (const block of exportBlocks(content)) {
    const style = styleOf(block);
    const lineHeight = style.size * PT_TO_MM * options.lineSpacing;
    pdf.setFont("times", style.font).setFontSize(style.size);
    const label = labelOf(block);
    const x = PAGE.margin + style.indent;
    const lines = pdf.splitTextToSize(block.text, textWidth - style.indent - (label ? 6 : 0));
    (lines as string[]).forEach((line, i) => {
      if (y + lineHeight > bottom) {
        pdf.addPage();
        y = PAGE.margin;
      }
      y += lineHeight;
      if (i === 0 && label) pdf.text(label, x, y);
      pdf.text(line, x + (label ? 6 : 0), y);
    });
    y += style.size * PT_TO_MM * style.gapAfter;
  }

  if (options.pageNumbers) {
    const pages = pdf.getNumberOfPages();
    pdf.setFont("times", "normal").setFontSize(10);
    for (let page = 1; page <= pages; page++) {
      pdf.setPage(page);
      pdf.text(String(page), PAGE.width / 2, PAGE.height - 12, { align: "center" });
    }
  }
  return pdf.output("blob");
}
