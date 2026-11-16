import type { Editor, JSONContent } from "@tiptap/react";
import { countCharacters, countWords } from "@/lib/text-stats";

/** What the editor counter shows for a whole document or for the selected text (STD-04). */
export type EditorStats = { words: number; characters: number; paragraphs: number };

/**
 * Text of every block that holds text directly (paragraph, heading, a list item's paragraph, a
 * quote's paragraph). A line break inside a block stays in the string as "\n". The schema only has
 * `text` and `hardBreak` as inline nodes; revisit this when an inline atom (mention) is added.
 */
function blockTexts(nodes: readonly JSONContent[], out: string[] = []): string[] {
  for (const node of nodes) {
    const children = node.content ?? [];
    if (children.some((c) => c.type === "text" || c.type === "hardBreak")) {
      out.push(children.map((c) => (c.type === "hardBreak" ? "\n" : (c.text ?? ""))).join(""));
    } else {
      blockTexts(children, out);
    }
  }
  return out;
}

/** Counts for a list of top-level nodes: words, characters with spaces, non-empty blocks. */
export function statsOfNodes(nodes: readonly JSONContent[]): EditorStats {
  const blocks = blockTexts(nodes);
  return {
    words: countWords(blocks.join(" ")),
    characters: blocks.reduce((sum, text) => sum + countCharacters(text), 0),
    paragraphs: blocks.filter((text) => text.trim() !== "").length,
  };
}

/** Counts for a whole document body. The title is not part of it. */
export function docStats(content: JSONContent): EditorStats {
  return statsOfNodes(content.content ?? []);
}

/** Counts for the selected text, or `null` while nothing is selected. */
export function selectionStats(editor: Pick<Editor, "state">): EditorStats | null {
  const { selection } = editor.state;
  if (selection.empty) return null;
  const nodes = selection.content().content.toJSON() as JSONContent[] | null;
  return statsOfNodes(nodes ?? []);
}

export function sameStats(a: EditorStats | null, b: EditorStats | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.words === b.words && a.characters === b.characters && a.paragraphs === b.paragraphs;
}
