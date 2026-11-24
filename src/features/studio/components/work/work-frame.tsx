"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { STUDIO_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";
import { chapterHref, workHref, type Work } from "../../works";

export type WorkTab = "ringkasan" | "isi";

/**
 * The page of one work (DESIGN.md 6.4): a bar with the way back to Studio, the title and the way
 * to keep writing; under it the two tabs as pills (Ringkasan, Isi), the same pills Studio uses;
 * then the tab's content. A full screen like the editor.
 */
export function WorkFrame({
  work,
  tab,
  children,
}: {
  work: Pick<Work, "id" | "title" | "openId">;
  tab: WorkTab;
  children: ReactNode;
}) {
  const t = useT().studioWork;
  const { untitled, tabs } = useT().studioDocuments;
  const studio = tabs.studio;
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface pt-(--safe-top)">
        <div className="mx-auto flex h-14 max-w-272 items-center gap-2 px-4 md:px-6">
          <Link
            href={STUDIO_HREF}
            className="-ml-2 flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-ink-muted hover:bg-subtle hover:text-ink"
          >
            <ArrowLeft size={18} aria-hidden />
            <span className="max-sm:sr-only">{studio}</span>
            <span className="sr-only"> · {t.back}</span>
          </Link>
          <span aria-hidden className="text-ink-muted">
            /
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{work.title || untitled}</p>
          <ButtonLink
            href={work.openId ? chapterHref(work.openId, work.id) : workHref(work, "isi")}
            size="sm"
          >
            {work.openId ? t.resume : t.startWriting}
          </ButtonLink>
        </div>
      </header>
      <div className="mx-auto max-w-272 px-4 pt-6 md:px-6">
        <Tabs
          label={t.tabsLabel}
          value={tab}
          variant="pill"
          items={[
            { id: "ringkasan", label: t.tabs.summary, href: workHref(work) },
            { id: "isi", label: t.tabs.chapters, href: workHref(work, "isi") },
          ]}
        />
      </div>
      <main className="mx-auto max-w-272 px-4 pt-6 pb-16 md:px-6">{children}</main>
    </div>
  );
}
