"use client";

import { FileText, FolderSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { Menu, type MenuEntry } from "@/components/ui/menu";

/** One line of the Dokumen list: icon, title, quiet meta, and a ⋯ menu (DESIGN.md 6.4). */
export function Row({
  kind,
  title,
  href,
  onOpen,
  meta,
  menuLabel,
  items,
  extra,
}: {
  kind: "folder" | "document";
  title: string;
  href?: string;
  onOpen?: () => void;
  meta: string;
  menuLabel: string;
  items: MenuEntry[];
  /** e.g. "Pulihkan" for items in Sampah. */
  extra?: ReactNode;
}) {
  const Icon = kind === "folder" ? FolderSimple : FileText;
  const heading =
    href !== undefined ? (
      <Link href={href} className="hover:underline hover:underline-offset-3">
        {title}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onOpen}
        className="cursor-pointer text-left hover:underline hover:underline-offset-3"
      >
        {title}
      </button>
    );
  return (
    <li className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-line py-4 md:grid-cols-[24px_minmax(0,1fr)_auto] md:gap-x-4 md:py-5">
      <Icon size={24} aria-hidden className="mt-0.5 text-ink-muted max-md:size-5" />
      <div className="min-w-0">
        <h2 className="heading-sm [overflow-wrap:anywhere] text-ink">{heading}</h2>
        <p className="mt-1 text-xs text-ink-muted">{meta}</p>
      </div>
      <div className="-mt-1.5 flex items-center gap-1 max-md:-mr-2.5">
        {extra}
        <Menu label={menuLabel} items={items} />
      </div>
    </li>
  );
}
