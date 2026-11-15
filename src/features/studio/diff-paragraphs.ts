import type { JSONContent } from "@tiptap/react";

function textOf(node: JSONContent): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(textOf).join(node.type === "listItem" ? " " : "");
}

/** Top-level blocks of a document as plain text, empty blocks dropped. */
export function paragraphsOf(content: JSONContent): string[] {
  return (content.content ?? []).map(textOf).filter((p) => p.trim() !== "");
}

/**
 * Indexes of paragraphs in `a` and `b` that have no counterpart in the other version, found with
 * a longest-common-subsequence over whole paragraphs. Used to mark what differs in the conflict
 * dialog; it does not merge anything.
 */
export function diffParagraphs(a: string[], b: string[]) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const onlyA = new Set<number>();
  const onlyB = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      onlyA.add(i++);
    } else {
      onlyB.add(j++);
    }
  }
  while (i < a.length) onlyA.add(i++);
  while (j < b.length) onlyB.add(j++);
  return { onlyA, onlyB };
}
