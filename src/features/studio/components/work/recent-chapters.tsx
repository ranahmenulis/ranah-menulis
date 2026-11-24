"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cardClass } from "@/components/ui/card";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatChanged } from "../../relative-time";
import type { DocumentSummary } from "../../storage/document-store";
import { studioStore } from "../../storage/store";
import { chapterHref, snippetOf } from "../../works";
import { DocumentMark } from "../documents/document-mark";

/** The opening words of these chapters, read once per set; missing ones stay blank. */
function useSnippets(ids: string[]) {
  const key = ids.join(",");
  const [snippets, setSnippets] = useState<{ key: string; text: Record<string, string> }>();
  useEffect(() => {
    let live = true;
    void Promise.all(
      key
        .split(",")
        .filter(Boolean)
        .map(async (id) => {
          const doc = await studioStore.get(id).catch(() => null);
          return [id, snippetOf(doc?.content)] as const;
        }),
    ).then((pairs) => live && setSnippets({ key, text: Object.fromEntries(pairs) }));
    return () => {
      live = false;
    };
  }, [key]);
  return snippets?.key === key ? snippets.text : {};
}

/**
 * The chapters touched last, as rows of small pages: title, the opening words, its place in the
 * work and when it changed. A row opens the chapter's editor.
 */
export function RecentChapters({
  workId,
  chapters,
  order,
  now,
}: {
  workId: string;
  chapters: DocumentSummary[];
  /** Chapter ids in reading order, for the "Bab n" label. */
  order: string[];
  now: number;
}) {
  const t = useT().studioWork.summary;
  const untitled = useT().studioDocuments.untitled;
  const locale = useLocale();
  const snippets = useSnippets(chapters.map((doc) => doc.id));

  return (
    <section aria-labelledby="work-recent" className={cardClass}>
      <h2 id="work-recent" className="heading-sm">
        {t.recent}
      </h2>
      {chapters.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{t.recentEmpty}</p>
      ) : (
        <ul className="mt-2">
          {chapters.map((doc) => (
            <li key={doc.id} className="border-b border-line last:border-b-0">
              <Link
                href={chapterHref(doc.id, workId)}
                className="rm-page-host -mx-3 grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 rounded-xl px-3 py-4 transition-colors hover:bg-subtle/70"
              >
                <DocumentMark page={doc} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-medium [overflow-wrap:anywhere]">
                      {doc.title || untitled}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {format(t.chapterBadge, { n: String(order.indexOf(doc.id) + 1) })} ·{" "}
                      {formatChanged(doc.updatedAt, now, locale)}
                    </span>
                  </span>
                  <span className="mt-1 block truncate font-serif text-sm text-ink-muted">
                    {snippets[doc.id] || t.emptyChapter}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
