"use client";

import { ArrowDown, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { IconButton } from "@/components/ui/icon-button";
import { format, useT } from "@/lib/i18n/provider";

/** Ids of the two buttons, so focus can return to the one that was pressed after a move. */
export const chapterButtonId = (docId: string, step: -1 | 1) =>
  `chapter-${step < 0 ? "up" : "down"}-${docId}`;

/** Move one chapter a step up or down; each button is off at its end of the list. */
export function ChapterControls({
  docId,
  title,
  first,
  last,
  onMove,
}: {
  docId: string;
  title: string;
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
}) {
  const t = useT().studioBook.chapters;
  return (
    <>
      <IconButton
        id={chapterButtonId(docId, -1)}
        label={format(t.moveUp, { title })}
        disabled={first}
        onClick={() => onMove(-1)}
      >
        <ArrowUp size={16} aria-hidden />
      </IconButton>
      <IconButton
        id={chapterButtonId(docId, 1)}
        label={format(t.moveDown, { title })}
        disabled={last}
        onClick={() => onMove(1)}
      >
        <ArrowDown size={16} aria-hidden />
      </IconButton>
    </>
  );
}
