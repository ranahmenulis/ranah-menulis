import type { JSONContent } from "@tiptap/react";
import type { PostBlock } from "./types";

/** Text of a node: text nodes joined, a hard break becomes a line break. */
function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  return (node.content ?? []).map(textOf).join("");
}

function blocksOfNode(node: JSONContent): PostBlock[] {
  switch (node.type) {
    case "paragraph":
      return [{ type: "paragraph", text: textOf(node) }];
    case "heading":
      return [{ type: "heading", text: textOf(node) }];
    case "blockquote":
      return [{ type: "quote", text: (node.content ?? []).map(textOf).join("\n") }];
    case "bulletList":
    case "orderedList":
      // Each item becomes a paragraph; list markers are not part of the public text.
      return (node.content ?? []).flatMap((item) =>
        (item.content ?? []).map((p): PostBlock => ({ type: "paragraph", text: textOf(p) })),
      );
    default:
      return [];
  }
}

/**
 * The selectable parts of a Studio document or an editor state: one block per top-level node, in
 * order. Bold and italic are not carried over; only the text is copied (STD-10). Empty blocks drop.
 */
export function blocksFromDocument(content: JSONContent): PostBlock[] {
  return (content.content ?? [])
    .flatMap(blocksOfNode)
    .map((b) => ({ ...b, text: b.text.trim() }))
    .filter((b) => b.text.length > 0);
}

/** Tiptap content for the direct-writing editor. Headings are not offered there; they stay text. */
export function blocksToDocument(blocks: PostBlock[]): JSONContent {
  const lines = (text: string): JSONContent[] =>
    text
      .split("\n")
      .flatMap((line, i) => [
        ...(i > 0 ? [{ type: "hardBreak" } satisfies JSONContent] : []),
        ...(line ? [{ type: "text", text: line } satisfies JSONContent] : []),
      ]);

  // An editor document needs at least one block, even when nothing is written yet.
  if (blocks.length === 0) return { type: "doc", content: [{ type: "paragraph" }] };

  return {
    type: "doc",
    content: blocks.map((b) =>
      b.type === "quote"
        ? { type: "blockquote", content: [{ type: "paragraph", content: lines(b.text) }] }
        : { type: "paragraph", content: lines(b.text) },
    ),
  };
}
