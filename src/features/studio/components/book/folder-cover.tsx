"use client";

import { BookCover } from "@/components/ui/book-cover";
import { cn } from "@/lib/cn";
import { useStoredFileUrl } from "@/lib/files/use-stored-file-url";
import { coverOf } from "../../book";
import { coverFileStore } from "../../storage/cover-store";
import type { StudioFolder } from "../../storage/document-store";

/**
 * A book's face: the uploaded cover cropped to the book's 1:1.43 shape, or the cover Studio makes
 * from the title (also while the image is missing from this device, so a book never loses it).
 * Decoration only: the title always sits next to it, so the image is hidden from screen readers.
 */
export function FolderCover({
  folder,
  width,
  className,
}: {
  folder: StudioFolder;
  width: number;
  className?: string;
}) {
  const cover = coverOf(folder);
  const file = useStoredFileUrl(cover?.fileId ?? "", coverFileStore);
  if (!cover || file.status === "missing") {
    return <BookCover title={folder.name} width={width} className={className} />;
  }
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 outline -outline-offset-1 outline-line", className)}
    >
      <span
        data-theme="light"
        className="relative block aspect-[1/1.43] overflow-hidden bg-subtle"
        style={{ width }}
      >
        {file.url && (
          // An object URL made on this device; nothing to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt="" className="absolute inset-0 size-full object-cover" />
        )}
      </span>
    </span>
  );
}
