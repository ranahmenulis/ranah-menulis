"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import type { DocumentKind } from "../../document-classification";
import { DocumentMark, FolderMark } from "./document-mark";

/** Rows after this many arrive together, so a long list does not trickle in. */
const STAGGER_ROWS = 12;

/**
 * One line of the Dokumen list: the document as a small page, title, quiet meta, and a ⋯ menu
 * (DESIGN.md 6.4). Rows rise in once when they mount, one after another.
 */
export function Row({
  kind,
  page,
  faded = false,
  index = 0,
  title,
  href,
  onOpen,
  meta,
  menuLabel,
  items,
  extra,
  tags,
  details,
}: {
  kind: "folder" | "document";
  /** The document the page mark is drawn from; a blank page without it. */
  page?: { id: string; kind?: DocumentKind; wordCount: number };
  /** Archived and trashed rows: the page sits back. */
  faded?: boolean;
  /** Position in the list, for the arrival stagger. */
  index?: number;
  title: string;
  href?: string;
  onOpen?: () => void;
  meta: string;
  menuLabel: string;
  items?: MenuEntry[];
  /** e.g. "Pulihkan" for items in Sampah. */
  extra?: ReactNode;
  /** Short publishing statuses beside the meta, e.g. "Dibagikan", "Dikirim ke proyek" (DESIGN.md 6.4). */
  tags?: string[];
  details?: ReactNode;
}) {
  const heading =
    href !== undefined ? (
      <Link href={href} className="hover:underline hover:underline-offset-3">
        {title}
      </Link>
    ) : onOpen ? (
      <button
        type="button"
        onClick={onOpen}
        className="cursor-pointer text-left hover:underline hover:underline-offset-3"
      >
        {title}
      </button>
    ) : (
      title
    );
  return (
    <li
      className="rm-row-in rm-page-host grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-line py-4 md:grid-cols-[34px_minmax(0,1fr)_auto] md:gap-x-4 md:py-5"
      style={{ "--i": Math.min(index, STAGGER_ROWS) } as CSSProperties}
    >
      {kind === "folder" ? (
        <FolderMark className="mt-0.5" />
      ) : (
        <DocumentMark page={page ?? { id: title, wordCount: 0 }} faded={faded} className="mt-0.5" />
      )}
      <div className="min-w-0">
        <h2 className="heading-sm [overflow-wrap:anywhere] text-ink">{heading}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs [overflow-wrap:anywhere] text-ink-muted">
          {meta}
          {tags?.map((tag) => (
            <span key={tag} className="rounded-full border border-line px-2 py-px text-ink">
              {tag}
            </span>
          ))}
        </p>
        {details}
      </div>
      <div className="-mt-1.5 flex items-center gap-1 max-md:-mr-2.5">
        {extra}
        {items && <Menu label={menuLabel} items={items} />}
      </div>
    </li>
  );
}
