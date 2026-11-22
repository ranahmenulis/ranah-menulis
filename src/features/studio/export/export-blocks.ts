import type { JSONContent } from "@tiptap/react";

/**
 * A Studio document flattened for export (STD-07): one block per paragraph, heading, quote or list
 * item, in reading order. Only the text and the alignment of paragraphs and headings are kept;
 * bold and italic are not carried over.
 */
export type TextAlignment = "left" | "center" | "right" | "justify";

export type ExportBlock =
  | { kind: "paragraph"; text: string; align: TextAlignment }
  | { kind: "heading"; text: string; level: number; align: TextAlignment }
  | { kind: "quote"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "number"; text: string; index: number };

function alignOf(node: JSONContent): TextAlignment {
  const value = node.attrs?.textAlign;
  return value === "center" || value === "right" || value === "justify" ? value : "left";
}

function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  return (node.content ?? []).map(textOf).join("");
}

function listItems(node: JSONContent): string[] {
  return (node.content ?? []).map((item) => (item.content ?? []).map(textOf).join("\n"));
}

function blocksOf(node: JSONContent): ExportBlock[] {
  switch (node.type) {
    case "paragraph":
      return [{ kind: "paragraph", text: textOf(node), align: alignOf(node) }];
    case "heading":
      return [
        {
          kind: "heading",
          text: textOf(node),
          level: Number(node.attrs?.level) || 1,
          align: alignOf(node),
        },
      ];
    case "blockquote":
      return [{ kind: "quote", text: (node.content ?? []).map(textOf).join("\n") }];
    case "bulletList":
      return listItems(node).map((text) => ({ kind: "bullet", text }));
    case "orderedList": {
      const start = Number(node.attrs?.start) || 1;
      return listItems(node).map((text, i) => ({ kind: "number", text, index: start + i }));
    }
    default:
      return [];
  }
}

/** Blocks of a document body; empty paragraphs are dropped, so spacing comes from the format. */
export function exportBlocks(content: JSONContent): ExportBlock[] {
  return (content.content ?? []).flatMap(blocksOf).filter((b) => b.text.trim() !== "");
}

/** Plain text: title on the first line, a blank line between blocks (STD-07, TXT). */
export function toPlainText(title: string, content: JSONContent): string {
  const lines = exportBlocks(content).map((b) => {
    switch (b.kind) {
      case "quote":
        return b.text
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");
      case "bullet":
        return `- ${b.text}`;
      case "number":
        return `${b.index}. ${b.text}`;
      default:
        return b.text;
    }
  });
  const head = title.trim();
  return [...(head ? [head] : []), ...lines].join("\n\n") + "\n";
}
