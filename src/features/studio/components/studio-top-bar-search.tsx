"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useState } from "react";
import { iconButtonClass } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { readViewerNow } from "@/lib/viewer";
import { useStudioSearchShortcut } from "../hooks/use-studio-search-shortcut";
import { StudioSearchDialog } from "./studio-search-dialog";

export function StudioTopBarSearch() {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => {
    if (readViewerNow().viewer === "masuk") setOpen(true);
  }, []);
  useStudioSearchShortcut(!open, show);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Cari di Studio"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className={cn(
          iconButtonClass,
          "ml-auto md:ml-4 md:flex md:h-9 md:w-60 md:items-center md:justify-start md:gap-2 md:bg-subtle md:px-3.5 md:text-sm md:text-ink-muted",
        )}
      >
        <MagnifyingGlass size={20} aria-hidden />
        <span className="max-md:hidden">Cari di Studio</span>
      </button>
      {open && <StudioSearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}
