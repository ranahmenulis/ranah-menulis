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
import { useEditorState, type Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { format, useT } from "@/lib/i18n/provider";
import {
  DEFAULT_LAYOUT,
  LAYOUT_FONTS,
  LAYOUT_SIZES_PT,
  type DocumentLayout,
  type LayoutFont,
} from "../document-layout";
import { FormatButton, runFormat } from "./format/format-button";
import { ToolbarSelect } from "./format/toolbar-select";
import { ToolRow } from "./format/tool-row";

type Alignment = "left" | "center" | "right" | "justify";
type Style = "p" | "h2" | "h3";

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px flex-none bg-line" />;

/**
 * Format toolbar: a hairline pill under the editor bar, centered over the writing column. Minimal
 * on purpose (client brief, 22 November 2026): font, size, paragraph style, alignment, the basic
 * marks and lists. Font and size belong to the whole document, so they change the layout; the rest
 * are commands on the selection. The active format is underlined, not recolored. On a phone the
 * row scrolls sideways.
 */
export function FormatBar({
  editor,
  layout = DEFAULT_LAYOUT,
  onLayoutChange,
  trailing,
}: {
  editor: Editor;
  layout?: DocumentLayout;
  onLayoutChange?: (next: DocumentLayout) => void;
  /** Shown after the toolbar in the same row (the view mode switch). */
  trailing?: ReactNode;
}) {
  const t = useT().studioLayout;
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      style: (e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : "p") as Style,
      align:
        (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ??
        ("left" as Alignment),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      quote: e.isActive("blockquote"),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
    }),
  });

  const setStyle = (style: string) => {
    const chain = runFormat(editor);
    if (style === "p") chain.setParagraph().run();
    else chain.setHeading({ level: style === "h2" ? 2 : 3 }).run();
  };

  const aligns: { value: Alignment; label: string; icon: typeof TextAlignLeft }[] = [
    { value: "left", label: t.toolbar.alignLeft, icon: TextAlignLeft },
    { value: "center", label: t.toolbar.alignCenter, icon: TextAlignCenter },
    { value: "right", label: t.toolbar.alignRight, icon: TextAlignRight },
    { value: "justify", label: t.toolbar.alignJustify, icon: TextAlignJustify },
  ];

  return (
    <ToolRow>
      <div
        role="toolbar"
        aria-label={t.toolbar.label}
        className="scroll-edge-fade flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full border border-line p-0.5 md:px-1.5"
      >
        <ToolbarSelect
          label={t.toolbar.font}
          value={layout.font}
          widthClass="w-40"
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
          onChange={setStyle}
        />
        <Divider />
        {aligns.map(({ value, label, icon: Icon }) => (
          <FormatButton
            key={value}
            label={label}
            pressed={active.align === value}
            onClick={() => runFormat(editor).setTextAlign(value).run()}
          >
            <Icon size={18} aria-hidden />
          </FormatButton>
        ))}
        <Divider />
        <FormatButton
          label={t.toolbar.bold}
          pressed={active.bold}
          onClick={() => runFormat(editor).toggleBold().run()}
        >
          <TextB size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label={t.toolbar.italic}
          pressed={active.italic}
          onClick={() => runFormat(editor).toggleItalic().run()}
        >
          <TextItalic size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label={t.toolbar.quote}
          pressed={active.quote}
          onClick={() => runFormat(editor).toggleBlockquote().run()}
        >
          <Quotes size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label={t.toolbar.bullets}
          pressed={active.bullets}
          onClick={() => runFormat(editor).toggleBulletList().run()}
        >
          <ListBullets size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label={t.toolbar.numbers}
          pressed={active.numbers}
          onClick={() => runFormat(editor).toggleOrderedList().run()}
        >
          <ListNumbers size={18} aria-hidden />
        </FormatButton>
      </div>
      {trailing}
    </ToolRow>
  );
}
