"use client";

import { useT } from "@/lib/i18n/provider";
import type { FolderCover as Cover } from "../../storage/document-store";
import { FolderCover } from "../book/folder-cover";

/**
 * The work's cover: the uploaded image, or the cover Studio draws from the title (DESIGN.md 7.6),
 * with one quiet button under it to add or change the image.
 */
export function WorkCover({
  title,
  cover,
  onEdit,
}: {
  title: string;
  cover: Cover | null;
  onEdit: () => void;
}) {
  const t = useT().studioWork.summary;
  const face = {
    id: "work",
    name: title,
    createdAt: 0,
    kind: "book" as const,
    cover: cover ?? undefined,
  };
  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <FolderCover folder={face} width={136} className="shadow-card" />
      <button
        type="button"
        onClick={onEdit}
        className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
      >
        {cover ? t.coverChange : t.coverAdd}
      </button>
    </div>
  );
}
