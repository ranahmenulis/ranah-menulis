"use client";

import { FolderSimple, PencilSimple, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cardClass, heroCardClass } from "@/components/ui/card";
import { useAccount } from "@/features/account/account-store";
import { formatDate } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { orderChapters } from "../../book";
import type { DocumentTarget } from "../../document-targets";
import type { DocumentList } from "../../hooks/use-document-list";
import { formatChanged } from "../../relative-time";
import type { FolderCover } from "../../storage/document-store";
import { studioStore } from "../../storage/store";
import { writingTime } from "../../writing-time";
import type { Work } from "../../works";
import type { Pending } from "../documents/pending";
import { CoverDialog } from "./cover-dialog";
import { RecentChapters } from "./recent-chapters";
import { SynopsisField } from "./synopsis-field";
import { WorkCover } from "./work-cover";
import { WorkGoals } from "./work-goals";

const chip =
  "inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 text-xs font-medium ring-1 ring-line transition-colors hover:bg-surface";
const addChip =
  "inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-line-strong px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink";

/** A figure of the hero: the number large, its name small under it. */
function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col-reverse">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums md:text-2xl">{value}</dd>
    </div>
  );
}

/**
 * The Ringkasan tab: a hero card with the cover, the title, its type, folder and tags, and four
 * figures; then the synopsis and the targets side by side, and the chapters last worked on.
 */
export function WorkSummary({
  work,
  list,
  onPending,
}: {
  work: Work;
  list: DocumentList;
  onPending: (pending: Pending) => void;
}) {
  const t = useT().studioWork.summary;
  const docs = useT().studioDocuments;
  const locale = useLocale();
  const { number } = useFormat();
  const { timeZone } = useAccount().profile;
  const [coverOpen, setCoverOpen] = useState(false);
  const now = list.loadedAt;
  const today = now > 0 ? writingTime(now, timeZone).day : "";
  const folder = work.type === "book" ? list.folders.find((f) => f.id === work.id) : undefined;
  const doc = work.type === "document" ? list.docs.find((d) => d.id === work.id) : undefined;
  const collection = list.folders.find((f) => f.id === work.collectionId);
  const title = work.title || docs.untitled;
  const chapters = list.docs.filter((d) => work.chapterIds.includes(d.id));
  const order = orderChapters(chapters, folder?.chapterOrder).map((d) => d.id);
  const recent = [...chapters].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  // A book keeps its details on the folder, a loose document on itself.
  async function save(patch: {
    synopsis?: string;
    cover?: FolderCover | null;
    targets?: DocumentTarget[];
  }) {
    if (work.type === "book") {
      await list.updateFolder(work.id, patch);
      return;
    }
    if (!(await studioStore.updateMeta(work.id, patch))) throw new Error("gone");
  }
  const classify = () =>
    folder
      ? onPending({ kind: "classifyBook", folder })
      : doc && onPending({ kind: "classification", doc });
  const rename = () =>
    folder
      ? onPending({ kind: "renameFolder", id: folder.id, name: folder.name })
      : doc && onPending({ kind: "rename", doc });

  return (
    <div className="mx-auto grid max-w-272 gap-6">
      <section aria-labelledby="work-title" className={heroCardClass}>
        <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start md:gap-8">
          <WorkCover title={title} cover={work.cover} onEdit={() => setCoverOpen(true)} />
          <div className="min-w-0">
            <div className="flex items-start gap-2">
              <h1
                id="work-title"
                className="min-w-0 font-serif text-3xl leading-tight font-bold [overflow-wrap:anywhere] md:text-[2.5rem]"
              >
                {title}
              </h1>
              <button
                type="button"
                aria-label={t.rename}
                onClick={rename}
                className="mt-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
              >
                <PencilSimple size={16} aria-hidden />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={work.genre ? chip : addChip}
                aria-label={
                  work.genre
                    ? format(t.kindLabel, { kind: docs.kinds[work.genre] })
                    : t.kindEmptyLabel
                }
                onClick={classify}
              >
                {!work.genre && <Plus size={12} weight="bold" aria-hidden />}
                {work.genre ? docs.kinds[work.genre] : t.kindAdd}
              </button>
              <button
                type="button"
                className={collection ? chip : addChip}
                aria-label={
                  collection ? format(t.folderLabel, { name: collection.name }) : t.folderEmptyLabel
                }
                onClick={() => onPending({ kind: "moveWork", work })}
              >
                {collection ? (
                  <FolderSimple size={14} aria-hidden />
                ) : (
                  <Plus size={12} weight="bold" aria-hidden />
                )}
                <span className="truncate">{collection ? collection.name : t.folderAdd}</span>
              </button>
              {work.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-accent-ink">
                  #{tag}
                </span>
              ))}
              <button
                type="button"
                onClick={classify}
                className="cursor-pointer text-xs text-ink-muted underline-offset-3 hover:text-ink hover:underline"
              >
                {t.tagsEdit}
              </button>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 md:grid-cols-4">
              <Figure value={number(work.words)} label={t.words} />
              <Figure value={number(work.chapters)} label={t.chapters} />
              <Figure value={formatChanged(work.updatedAt, now, locale)} label={t.changed} />
              <Figure value={formatDate(work.createdAt, locale)} label={t.created} />
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className={cardClass}>
          <SynopsisField
            key={work.id}
            initial={work.synopsis}
            onSave={(synopsis) => save({ synopsis })}
          />
        </section>
        <WorkGoals
          words={work.words}
          targets={work.targets}
          today={today}
          onChange={(targets) => save({ targets })}
        />
      </div>

      <RecentChapters workId={work.id} chapters={recent} order={order} now={now} />

      {coverOpen && (
        <CoverDialog
          title={title}
          saved={work.cover}
          onSave={(cover) => save({ cover })}
          onClose={() => setCoverOpen(false)}
        />
      )}
    </div>
  );
}
