import { format } from "@/lib/i18n/provider";
import { moveChapter } from "../../book";
import type { studioBook } from "../../copy/book-id";
import { ChapterControls } from "./chapter-controls";

type Props = {
  copy: typeof studioBook.chapters;
  index: number;
  ids: string[];
  title: string;
  onReorder?: (ids: string[], moved: { id: string; step: -1 | 1 }) => void;
};

/** What a chapter row adds to a document row: "Chapter n" before the meta and the move buttons. */
export function chapterExtras({ copy, index, ids, title, onReorder }: Props) {
  const id = ids[index];
  return {
    prefix: `${format(copy.number, { n: String(index + 1) })} · `,
    controls: (
      <ChapterControls
        docId={id}
        title={title}
        first={index === 0}
        last={index === ids.length - 1}
        onMove={(step) => {
          const next = moveChapter(ids, id, step);
          if (next) onReorder?.(next, { id, step });
        }}
      />
    ),
  };
}
