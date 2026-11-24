"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { newDocumentHref } from "@/features/app-shell/nav";
import { useLocale, useT } from "@/lib/i18n/provider";
import { orderChapters } from "../../book";
import { useChapterReorder } from "../../hooks/use-chapter-reorder";
import type { DocumentList } from "../../hooks/use-document-list";
import { studioStore } from "../../storage/store";
import { chapterHref, type Work } from "../../works";
import { chapterExtras } from "../book/chapter-extras";
import { Row } from "../documents/document-row";
import { documentMeta } from "../documents/document-text";

/**
 * The Isi tab: the chapters of the work in reading order, each opening its own editor, with the
 * way to add one. A loose document is a work of one chapter; adding a second one turns it into a
 * book first (the document moves into a new book of its own).
 */
export function WorkChapters({ work, list }: { work: Work; list: DocumentList }) {
  const t = useT().studioWork.chapters;
  const docs = useT().studioDocuments;
  const book = useT().studioBook;
  const locale = useLocale();
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; failed: boolean } | null>(null);
  const busy = useRef(false);
  const isBook = work.type === "book";
  const report = (text: string, failed: boolean) => setMessage({ text, failed });
  const reorder = useChapterReorder(list, isBook ? work.id : null, report);

  const chapters = orderChapters(
    list.docs.filter((doc) => work.chapterIds.includes(doc.id)),
    isBook ? list.folders.find((f) => f.id === work.id)?.chapterOrder : undefined,
  );
  const ids = chapters.map((doc) => doc.id);

  async function addChapter() {
    if (busy.current) return;
    busy.current = true;
    setMessage(null);
    try {
      let bookId = work.id;
      if (!isBook) {
        const source = chapters[0];
        const created = await studioStore.createFolder(work.title || docs.untitled, {
          kind: "book",
          chapterOrder: ids,
          ...(work.genre ? { genre: work.genre } : {}),
          ...(work.tags.length ? { tags: work.tags } : {}),
          ...(work.synopsis ? { synopsis: work.synopsis } : {}),
        });
        bookId = created.id;
        if (source) await studioStore.updateMeta(source.id, { folderId: bookId });
      }
      router.push(`${newDocumentHref(bookId)}&dari=${encodeURIComponent(bookId)}`);
    } catch {
      setMessage({ text: t.addFailed, failed: true });
    } finally {
      busy.current = false;
    }
  }

  return (
    <section aria-labelledby="work-chapters-heading" className="mx-auto max-w-272">
      <div className="flex items-center justify-between gap-3">
        <h1 id="work-chapters-heading" className="heading-lg">
          {t.heading}
        </h1>
        <Button size="sm" onClick={() => void addChapter()}>
          {t.add}
        </Button>
      </div>
      {!isBook && <p className="mt-2 text-sm text-ink-muted">{t.addNote}</p>}
      <p
        role="status"
        className={
          message ? `mt-3 text-sm ${message.failed ? "text-danger" : "text-ink"}` : "sr-only"
        }
      >
        {message?.text}
      </p>
      <div className="mt-4 rounded-2xl border border-line bg-surface px-4 py-1 shadow-card md:px-5">
        {chapters.length === 0 ? (
          <EmptyState className="pt-10 pb-10">{t.empty}</EmptyState>
        ) : (
          <ul>
            {chapters.map((doc, index) => {
              const title = doc.title || docs.untitled;
              const extras = isBook
                ? chapterExtras({
                    copy: book.chapters,
                    index,
                    ids,
                    title,
                    onReorder: (next, moved) => void reorder(next, moved),
                  })
                : null;
              return (
                <Row
                  key={doc.id}
                  index={index}
                  kind="document"
                  page={doc}
                  title={title}
                  href={chapterHref(doc.id, work.id)}
                  meta={
                    (extras?.prefix ?? "") +
                    documentMeta(
                      docs,
                      locale,
                      "changed",
                      doc.wordCount,
                      doc.updatedAt,
                      list.loadedAt,
                    )
                  }
                  extra={extras?.controls}
                  menuLabel={title}
                />
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
