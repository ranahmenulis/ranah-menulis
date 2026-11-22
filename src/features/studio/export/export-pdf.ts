import type { JSONContent } from "@tiptap/react";
import {
  DEFAULT_LAYOUT,
  MM_PER_PT,
  PAGE_MM,
  TITLE_PT,
  textWidthMm,
  type DocumentLayout,
  type LayoutFont,
} from "../document-layout";
import { exportBlocks, type ExportBlock, type TextAlignment } from "./export-blocks";

export type PdfOptions = {
  /** The title alone on the first page, before the text starts on page two. */
  titlePage: boolean;
  pageNumbers: boolean;
};

export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  titlePage: false,
  pageNumbers: true,
};

/**
 * Only the standard PDF fonts are used, so no font file is embedded: Times New Roman is Times,
 * Inter is drawn as Helvetica, and Merriweather as Times.
 */
export const PDF_FONT_FOR: Record<LayoutFont, "times" | "helvetica"> = {
  times: "times",
  sans: "helvetica",
  serif: "times",
};

type Style = {
  size: number;
  font: "normal" | "bold" | "italic";
  indent: number;
  gapAfter: number;
  align: TextAlignment;
};

function styleOf(block: ExportBlock, body: number): Style {
  switch (block.kind) {
    case "heading":
      return {
        size: Math.round(body * (block.level === 2 ? 1.35 : 1.15) * 10) / 10,
        font: "bold",
        indent: 0,
        gapAfter: 0.5,
        align: block.align,
      };
    case "quote":
      return { size: body, font: "italic", indent: 10, gapAfter: 0.75, align: "left" };
    case "bullet":
    case "number":
      return { size: body, font: "normal", indent: 6, gapAfter: 0.3, align: "left" };
    default:
      return { size: body, font: "normal", indent: 0, gapAfter: 0.75, align: block.align };
  }
}

function labelOf(block: ExportBlock): string {
  if (block.kind === "bullet") return "•";
  if (block.kind === "number") return `${block.index}.`;
  return "";
}

/**
 * Builds the PDF in the browser (jsPDF is loaded only when someone exports), on A5 paper with the
 * margin, font, size and line spacing of the document. Characters outside the standard fonts may
 * not draw. Returns the file.
 */
export async function buildPdf(
  title: string,
  content: JSONContent,
  options: PdfOptions,
  layout: DocumentLayout = DEFAULT_LAYOUT,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: [PAGE_MM.width, PAGE_MM.height], compress: true });
  const family = PDF_FONT_FOR[layout.font];
  const margin = layout.marginMm;
  const textWidth = textWidthMm(layout);
  const bottom = PAGE_MM.height - margin;
  let y = margin;

  const heading = title.trim();
  if (options.titlePage && heading) {
    pdf.setFont(family, "bold").setFontSize(28);
    const lines = pdf.splitTextToSize(heading, textWidth) as string[];
    pdf.text(lines, PAGE_MM.width / 2, PAGE_MM.height / 2 - 20, { align: "center" });
    pdf.addPage();
  } else if (heading) {
    pdf.setFont(family, "bold").setFontSize(TITLE_PT);
    const lines = pdf.splitTextToSize(heading, textWidth) as string[];
    const lineHeight = TITLE_PT * MM_PER_PT * 1.3;
    lines.forEach((line, i) => pdf.text(line, margin, y + lineHeight * (i + 0.8)));
    y += lines.length * lineHeight + TITLE_PT * MM_PER_PT;
  }

  for (const block of exportBlocks(content)) {
    const style = styleOf(block, layout.sizePt);
    const lineHeight = style.size * MM_PER_PT * layout.lineSpacing;
    pdf.setFont(family, style.font).setFontSize(style.size);
    const label = labelOf(block);
    const x = margin + style.indent;
    const width = textWidth - style.indent - (label ? 6 : 0);
    const lines = pdf.splitTextToSize(block.text, width) as string[];
    lines.forEach((line, i) => {
      if (y + lineHeight > bottom) {
        pdf.addPage();
        y = margin;
      }
      y += lineHeight;
      if (i === 0 && label) pdf.text(label, x, y);
      const at = x + (label ? 6 : 0);
      const last = i === lines.length - 1;
      if (style.align === "center") pdf.text(line, at + width / 2, y, { align: "center" });
      else if (style.align === "right") pdf.text(line, at + width, y, { align: "right" });
      // The last line of a justified paragraph stays on the left, as in a word processor.
      else if (style.align === "justify" && !last) {
        pdf.text(line, at, y, { align: "justify", maxWidth: width });
      } else pdf.text(line, at, y);
    });
    y += style.size * MM_PER_PT * style.gapAfter;
  }

  if (options.pageNumbers) {
    const pages = pdf.getNumberOfPages();
    pdf.setFont(family, "normal").setFontSize(10);
    for (let page = 1; page <= pages; page++) {
      pdf.setPage(page);
      pdf.text(String(page), PAGE_MM.width / 2, PAGE_MM.height - margin / 2, { align: "center" });
    }
  }
  return pdf.output("blob");
}
