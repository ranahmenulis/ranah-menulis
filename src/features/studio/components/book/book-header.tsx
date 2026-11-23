"use client";

import { Button } from "@/components/ui/button";
import { useFormat } from "@/lib/i18n/use-format";
import { format, useT } from "@/lib/i18n/provider";
import { bookWords, chaptersOf, isBook } from "../../book";
import type { DocumentSummary, StudioFolder } from "../../storage/document-store";
import { FolderCover } from "./folder-cover";

/** The head of an open book: its cover, title, size, and the way to its settings. */
export function BookHeader({
  folder,
  docs,
  onSettings,
}: {
  folder: StudioFolder;
  docs: DocumentSummary[];
  onSettings: () => void;
}) {
  const t = useT().studioBook;
  const { number } = useFormat();
  if (!isBook(folder)) return null;
  const chapterList = chaptersOf(docs, folder.id);
  const chapters = chapterList.length;
  const words = bookWords(chapterList);
  const summary = format(chapters === 1 ? t.header.summaryOne : t.header.summary, {
    chapters: number(chapters),
    words: number(words),
  });
  return (
    <section className="mt-5 flex items-start gap-4 border-b border-line pb-5 md:gap-5">
      <FolderCover folder={folder} width={88} />
      <div className="min-w-0">
        <p className="text-sm text-ink-muted">{t.header.coverNote}</p>
        <p className="mt-1 text-sm font-medium">{summary}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={onSettings}>
          {t.settings}
        </Button>
      </div>
    </section>
  );
}
