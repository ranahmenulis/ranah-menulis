"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/i18n/format";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { formatChanged } from "../../relative-time";
import type { DocumentKind } from "../../document-classification";
import type { WorkSort, WorkSortKey } from "../../works";

/** Rows after this many arrive together, so a long list does not trickle in. */
const STAGGER_ROWS = 12;

/** One line of the table, already resolved: what it shows and what its ⋯ menu does. */
export type TableRow = {
  key: string;
  type: "folder" | "document" | "book";
  title: string;
  href?: string;
  onOpen?: () => void;
  mark: ReactNode;
  /** The line under the title on a narrow screen, where the other columns are folded away. */
  meta: string;
  /** The "n chapters" or "n documents" hint beside the title on a wide screen. */
  sub: string;
  words: number;
  genre: DocumentKind | null;
  tags: string[];
  /** Short publishing states, e.g. "Dibagikan". */
  badges: string[];
  updatedAt: number;
  createdAt: number;
  menuLabel: string;
  menu: MenuEntry[];
};

const SORTABLE: { key: WorkSortKey; column: "title" | "words" | "kind" | "updated" | "created" }[] =
  [
    { key: "title", column: "title" },
    { key: "words", column: "words" },
    { key: "genre", column: "kind" },
    { key: "updated", column: "updated" },
    { key: "created", column: "created" },
  ];

function SortHead({
  sortKey,
  label,
  sort,
  onSort,
  className,
}: {
  sortKey: WorkSortKey;
  label: string;
  sort: WorkSort;
  onSort: (key: WorkSortKey) => void;
  className?: string;
}) {
  const t = useT().studioDocuments.table;
  const active = sort.key === sortKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
      className={cn("px-3 py-3 text-left text-xs font-medium text-ink-muted", className)}
    >
      <button
        type="button"
        aria-label={format(t.sortBy, { column: label })}
        onClick={() => onSort(sortKey)}
        className={cn(
          "rounded inline-flex cursor-pointer items-center gap-1 hover:text-ink",
          active && "text-ink",
        )}
      >
        {label}
        <span aria-hidden className="w-3 text-center">
          {active ? (sort.dir === "asc" ? "↑" : "↓") : ""}
        </span>
      </button>
    </th>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-subtle px-2 py-px text-xs [overflow-wrap:anywhere]"
        >
          {tag}
        </span>
      ))}
    </span>
  );
}

function TitleCell({ row }: { row: TableRow }) {
  const heading = row.href ? (
    <Link href={row.href} className="hover:underline hover:underline-offset-3">
      {row.title}
    </Link>
  ) : row.onOpen ? (
    <button
      type="button"
      onClick={row.onOpen}
      className="cursor-pointer text-left hover:underline hover:underline-offset-3"
    >
      {row.title}
    </button>
  ) : (
    row.title
  );
  return (
    <td className="px-3 py-4 align-top">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 block w-8 shrink-0">{row.mark}</span>
        <div className="min-w-0">
          <p className="heading-sm [overflow-wrap:anywhere] text-ink">{heading}</p>
          <p className="mt-1 text-xs text-ink-muted md:hidden">{row.meta}</p>
          <p className="mt-1 hidden text-xs text-ink-muted md:block">{row.sub}</p>
          {row.badges.length > 0 && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {row.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-line px-2 py-px text-xs text-ink"
                >
                  {badge}
                </span>
              ))}
            </span>
          )}
          {(row.genre || row.tags.length > 0) && (
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
              <Tags tags={row.tags} />
            </span>
          )}
        </div>
      </div>
    </td>
  );
}

/**
 * The Naskah table (DESIGN.md 6.4): Judul, Kata, Jenis, Tag, Diubah, Dibuat, Aksi. Headers sort;
 * below md the secondary columns fold into a line under the title. Rows rise in once.
 */
export function WorksTable({
  rows,
  sort,
  onSort,
  now,
  timeZone,
}: {
  rows: TableRow[];
  sort: WorkSort;
  onSort: (key: WorkSortKey) => void;
  now: number;
  /** Fixed zone for sample data (landing); omit to use the device's zone. */
  timeZone?: string;
}) {
  const t = useT().studioDocuments;
  const locale = useLocale();
  const labels = t.table;
  const heads = Object.fromEntries(SORTABLE.map(({ key, column }) => [key, labels[column]]));
  return (
    <table className="w-full table-auto border-collapse [&_tr>*:first-child]:pl-5 md:[&_tr>*:first-child]:pl-6 [&_tr>*:last-child]:pr-4">
      <caption className="sr-only">{labels.caption}</caption>
      <thead className="border-b border-line bg-subtle/60 max-md:sr-only">
        <tr>
          <SortHead sortKey="title" label={heads.title} sort={sort} onSort={onSort} />
          <SortHead
            sortKey="words"
            label={heads.words}
            sort={sort}
            onSort={onSort}
            className="hidden md:table-cell"
          />
          <SortHead
            sortKey="genre"
            label={heads.genre}
            sort={sort}
            onSort={onSort}
            className="hidden md:table-cell"
          />
          <th
            scope="col"
            className="hidden px-3 py-3 text-left text-xs font-medium text-ink-muted lg:table-cell"
          >
            {labels.tags}
          </th>
          <SortHead
            sortKey="updated"
            label={heads.updated}
            sort={sort}
            onSort={onSort}
            className="hidden md:table-cell"
          />
          <SortHead
            sortKey="created"
            label={heads.created}
            sort={sort}
            onSort={onSort}
            className="hidden lg:table-cell"
          />
          <th scope="col" className="w-12 px-3 py-3 text-right text-xs font-medium text-ink-muted">
            <span className="sr-only">{labels.actions}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.key}
            className="rm-row-in rm-page-host border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-subtle/70"
            style={{ "--i": Math.min(index, STAGGER_ROWS) } as CSSProperties}
          >
            <TitleCell row={row} />
            <td className="hidden px-3 py-4 align-top text-sm tabular-nums md:table-cell">
              {row.words.toLocaleString(locale === "en" ? "en-US" : "id-ID")}
            </td>
            <td className="hidden px-3 py-4 align-top text-sm md:table-cell">
              {row.genre ? (
                <span className="rounded-full bg-subtle px-2.5 py-0.5 text-xs">
                  {t.kinds[row.genre]}
                </span>
              ) : (
                <span className="text-ink-muted" aria-label={t.table.noKind}>
                  {t.table.noKind}
                </span>
              )}
            </td>
            <td className="hidden px-3 py-4 align-top lg:table-cell">
              <Tags tags={row.tags} />
            </td>
            <td className="hidden px-3 py-4 align-top text-sm whitespace-nowrap text-ink-muted md:table-cell">
              {formatChanged(row.updatedAt, now, locale, timeZone)}
            </td>
            <td className="hidden px-3 py-4 align-top text-sm whitespace-nowrap text-ink-muted lg:table-cell">
              {formatDate(row.createdAt, locale, {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone,
              })}
            </td>
            <td className="px-3 py-3 text-right align-top">
              <Menu label={row.menuLabel} items={row.menu} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
