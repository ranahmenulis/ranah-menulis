"use client";

import { fill } from "@/features/studio/copy/fill";
import { useFormat } from "@/lib/i18n/use-format";
import { useT } from "@/lib/i18n/provider";

/** The chapters of a whole-book manuscript with their words, so the reviewer sees its shape. */
export function BookChapters({ chapters }: { chapters: { title: string; words: number }[] }) {
  const t = useT().kelolaEditor.review.text;
  const { number } = useFormat();
  return (
    <details className="rm-details border border-line px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">
        {fill(t.chapters, { n: number(chapters.length) })}
      </summary>
      <ol className="mt-3 grid gap-1 text-sm">
        {chapters.map((chapter, index) => (
          <li key={index} className="flex justify-between gap-4">
            <span className="wrap-anywhere">{chapter.title || t.untitledChapter}</span>
            <span className="shrink-0 text-ink-muted">
              {fill(t.chapterWords, { n: number(chapter.words) })}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}
