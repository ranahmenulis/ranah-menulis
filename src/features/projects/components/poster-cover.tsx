"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { projectPosterStore } from "@/lib/files/project-file-store";
import { useStoredFileUrl } from "@/lib/files/use-stored-file-url";
import type { ProjectPoster } from "../types";

type Props = {
  poster: ProjectPoster;
  /** Read the poster's alt text aloud (the project header); elsewhere the cover is decoration. */
  describe?: boolean;
  className?: string;
  /** Shown when the file is gone from this device, so a project never loses its face. */
  fallback: ReactNode;
};

/**
 * A project's uploaded poster in the same 4:5 frame as the generated cover, cropped to fill it.
 * While the file loads the frame is a quiet block, so the page does not flash a generated cover
 * first. The poster is a printed object like the generated cover: it keeps its own colours.
 */
export function PosterCover({ poster, describe = false, className, fallback }: Props) {
  const file = useStoredFileUrl(poster.fileId, projectPosterStore());
  if (file.status === "missing") return fallback;
  return (
    <span
      aria-hidden={describe ? undefined : true}
      data-cover="poster"
      className={cn("rm-cover block outline -outline-offset-1 outline-line", className)}
    >
      <span
        data-theme="light"
        className="relative block aspect-[4/5] overflow-hidden bg-subtle text-ink"
      >
        {file.url && (
          // An object URL made on this device; nothing to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={describe ? poster.alt : ""}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </span>
    </span>
  );
}
