"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { format, useT } from "@/lib/i18n/provider";

/**
 * "Continue writing" shortcut in the app frame, reachable from any page (Novlr "Resume Writing").
 * A plain link, never a filled button, so it does not compete with the page's one main action.
 * Draws nothing without a document to resume. Phones are not covered: the bottom bar has Tulis and
 * Beranda has its own "Lanjutkan menulis" row.
 */
export function ResumeWriting({
  variant,
  doc,
}: {
  variant: "card" | "icon";
  doc: Pick<StudioDocument, "id" | "title"> | null;
}) {
  const { resume } = useT().shell;
  if (!doc) return null;

  const title = doc.title.trim() || resume.untitled;
  const href = `/studio/${doc.id}`;

  if (variant === "icon") {
    return (
      <Link
        href={href}
        aria-label={format(resume.railLabel, { title })}
        className="mt-2 grid justify-items-center gap-1 border-t border-line py-3 text-xs font-medium text-ink-muted no-underline hover:text-ink"
      >
        <PencilSimpleLine size={24} aria-hidden />
        {resume.short}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="mt-4 grid min-w-0 gap-0.5 border-t border-line px-3 pt-4 text-sm no-underline hover:text-ink"
    >
      <span className="text-xs font-medium text-ink-muted">{resume.label}</span>
      <span className="truncate font-medium">{title}</span>
    </Link>
  );
}
