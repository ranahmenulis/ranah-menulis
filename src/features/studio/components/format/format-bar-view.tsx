"use client";

import {
  ListBullets,
  ListNumbers,
  Quotes,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextItalic,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { format, useT } from "@/lib/i18n/provider";
import {
  DEFAULT_LAYOUT,
  LAYOUT_FONTS,
  LAYOUT_SIZES_PT,
  type DocumentLayout,
  type LayoutFont,
} from "../../document-layout";
import { FormatButton } from "./format-button";
import { ToolbarSelect } from "./toolbar-select";
import { ToolRow } from "./tool-row";

export type Alignment = "left" | "center" | "right" | "justify";
export type Style = "p" | "h2" | "h3";

const Divider = () => <span aria-hidden className="mx-1.5 h-5 w-px flex-none bg-line" />;

export type FormatState = {
  style: Style;
  align: Alignment;
  bold: boolean;
  italic: boolean;
  quote: boolean;
  bullets: boolean;
  numbers: boolean;
};

export type FormatCommand =
  | { type: "style"; value: Style }
  | { type: "align"; value: Alignment }
  | { type: "bold" | "italic" | "quote" | "bullets" | "numbers" };

/**
 * The toolbar as it looks, without an editor: `FormatBar` feeds it the live state, and the landing
 * page shows it with a fixed state so its Studio stage is the real toolbar.
 */
export function FormatBarView({
  active,
  layout = DEFAULT_LAYOUT,
  onLayoutChange,
  onCommand,
  trailing,
}: {
  active: FormatState;
  layout?: DocumentLayout;
  onLayoutChange?: (next: DocumentLayout) => void;
  onCommand: (command: FormatCommand) => void;
  trailing?: ReactNode;
}) {
  const t = useT().studioLayout;

  const aligns: { value: Alignment; label: string; icon: typeof TextAlignLeft }[] = [
    { value: "left", label: t.toolbar.alignLeft, icon: TextAlignLeft },
    { value: "center", label: t.toolbar.alignCenter, icon: TextAlignCenter },
    { value: "right", label: t.toolbar.alignRight, icon: TextAlignRight },
    { value: "justify", label: t.toolbar.alignJustify, icon: TextAlignJustify },
  ];
  const marks = [
    { type: "bold", label: t.toolbar.bold, icon: TextB },
    { type: "italic", label: t.toolbar.italic, icon: TextItalic },
    { type: "quote", label: t.toolbar.quote, icon: Quotes },
    { type: "bullets", label: t.toolbar.bullets, icon: ListBullets },
    { type: "numbers", label: t.toolbar.numbers, icon: ListNumbers },
  ] as const;

  return (
    <ToolRow>
      <div
        role="toolbar"
        aria-label={t.toolbar.label}
        className="scroll-edge-fade flex min-w-0 [scrollbar-width:none] items-center gap-0.5 overflow-x-auto rounded-full border border-line bg-surface p-1 md:px-1.5 md:shadow-card [&::-webkit-scrollbar]:hidden"
      >
        <ToolbarSelect
          label={t.toolbar.font}
          value={layout.font}
          widthClass="w-44"
          options={LAYOUT_FONTS.map((f) => ({ value: f, label: t.fonts[f] }))}
          onChange={(font) => onLayoutChange?.({ ...layout, font: font as LayoutFont })}
        />
        <ToolbarSelect
          label={t.toolbar.size}
          value={String(layout.sizePt)}
          widthClass="w-20"
          options={LAYOUT_SIZES_PT.map((n) => ({
            value: String(n),
            label: format(t.toolbar.sizeOption, { n: String(n) }),
          }))}
          onChange={(size) =>
            onLayoutChange?.({ ...layout, sizePt: Number(size) as DocumentLayout["sizePt"] })
          }
        />
        <ToolbarSelect
          label={t.toolbar.heading}
          value={active.style}
          widthClass="w-32"
          options={[
            { value: "p", label: t.toolbar.paragraph },
            { value: "h2", label: t.toolbar.heading2 },
            { value: "h3", label: t.toolbar.heading3 },
          ]}
          onChange={(style) => onCommand({ type: "style", value: style as Style })}
        />
        <Divider />
        {aligns.map(({ value, label, icon: Icon }) => (
          <FormatButton
            key={value}
            label={label}
            pressed={active.align === value}
            onClick={() => onCommand({ type: "align", value })}
          >
            <Icon size={18} aria-hidden />
          </FormatButton>
        ))}
        <Divider />
        {marks.map(({ type, label, icon: Icon }) => (
          <FormatButton
            key={type}
            label={label}
            pressed={active[type]}
            onClick={() => onCommand({ type })}
          >
            <Icon size={18} aria-hidden />
          </FormatButton>
        ))}
      </div>
      {trailing}
    </ToolRow>
  );
}
