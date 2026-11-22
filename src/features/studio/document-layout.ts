/**
 * Page layout of one Studio document (client brief, 22 November 2026): Times New Roman 12 pt,
 * title 20 pt bold, A5 paper, 20 mm margins, line spacing 1.5. Every field can be changed per
 * document; a document without a stored layout simply uses the defaults. Pure, no DOM.
 */

/** `times` is Times New Roman (Tinos where it is not installed), `sans` is Inter, `serif` Merriweather. */
export const LAYOUT_FONTS = ["times", "sans", "serif"] as const;
export const LAYOUT_SIZES_PT = [10, 11, 12, 13, 14, 16] as const;
export const LAYOUT_LINE_SPACINGS = [1, 1.15, 1.5, 2] as const;

export const MARGIN_MIN_MM = 10;
export const MARGIN_MAX_MM = 40;
export const MARGIN_STEP_MM = 5;

/** A5, in millimetres. */
export const PAGE_MM = { width: 148, height: 210 } as const;
/** The title is always 20 pt bold (client brief); it is not adjustable. */
export const TITLE_PT = 20;
export const MM_PER_PT = 25.4 / 72;

export type LayoutFont = (typeof LAYOUT_FONTS)[number];

export type DocumentLayout = {
  font: LayoutFont;
  sizePt: (typeof LAYOUT_SIZES_PT)[number];
  lineSpacing: (typeof LAYOUT_LINE_SPACINGS)[number];
  marginMm: number;
};

export const DEFAULT_LAYOUT: DocumentLayout = {
  font: "times",
  sizePt: 12,
  lineSpacing: 1.5,
  marginMm: 20,
};

/** Reads a stored layout field by field, so a hand-edited or older record never breaks the editor. */
export function sanitizeLayout(value: unknown): DocumentLayout {
  const defaults = DEFAULT_LAYOUT;
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const input = value as Record<string, unknown>;
  const margin = input.marginMm;
  const marginOk =
    typeof margin === "number" &&
    Number.isFinite(margin) &&
    margin >= MARGIN_MIN_MM &&
    margin <= MARGIN_MAX_MM;
  return {
    font: LAYOUT_FONTS.find((f) => f === input.font) ?? defaults.font,
    sizePt: LAYOUT_SIZES_PT.find((s) => s === input.sizePt) ?? defaults.sizePt,
    lineSpacing: LAYOUT_LINE_SPACINGS.find((s) => s === input.lineSpacing) ?? defaults.lineSpacing,
    marginMm: marginOk ? margin : defaults.marginMm,
  };
}

export function sameLayout(a: DocumentLayout, b: DocumentLayout): boolean {
  return (
    a.font === b.font &&
    a.sizePt === b.sizePt &&
    a.lineSpacing === b.lineSpacing &&
    a.marginMm === b.marginMm
  );
}

/** Width of the text area on the page, in millimetres. */
export function textWidthMm(layout: DocumentLayout): number {
  return PAGE_MM.width - layout.marginMm * 2;
}

/** Height of the text area on the page, in millimetres. */
export function textHeightMm(layout: DocumentLayout): number {
  return PAGE_MM.height - layout.marginMm * 2;
}

const FONT_STACKS: Record<LayoutFont, string> = {
  times: '"Times New Roman", var(--font-tinos), Times, serif',
  sans: "var(--font-sans)",
  serif: "var(--font-serif)",
};

/** CSS custom properties the editor and the page preview read; `pt` and `mm` are native CSS units. */
export function layoutVars(layout: DocumentLayout): Record<string, string> {
  return {
    "--doc-font": FONT_STACKS[layout.font],
    "--doc-size": `${layout.sizePt}pt`,
    "--doc-line": String(layout.lineSpacing),
    "--doc-margin": `${layout.marginMm}mm`,
    "--doc-text-width": `${textWidthMm(layout)}mm`,
    "--doc-title-size": `${TITLE_PT}pt`,
  };
}
