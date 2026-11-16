"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** aria-label for the close button, e.g. "Tutup bantuan". */
  closeLabel: string;
  children: ReactNode;
  /** md and up: width of the panel in px. Studio help is 360, comments are 420. */
  width?: 360 | 420;
  /** Extra classes for the md+ panel, mainly the top offset below the app bar. */
  className?: string;
};

const DESKTOP = "(min-width: 48rem)";

/**
 * "Laci" (DESIGN.md 7.1): a panel from the right that adds context without leaving the page.
 * md and up it is a non-modal panel next to the content (the page stays usable); below md it is a
 * modal bottom sheet. Built on <dialog>, so the mode is chosen when it opens.
 */
export function Drawer({
  open,
  onClose,
  title,
  closeLabel,
  children,
  width = 360,
  className,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      const desktop = window.matchMedia?.(DESKTOP).matches ?? true;
      if (desktop) el.show();
      else el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
    // A modal sheet left open on a hidden (cached) page would block the page navigated to.
    return () => {
      if (el.open) el.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        // A non-modal dialog does not fire "cancel" on Escape.
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ "--drawer-w": `${width}px` } as React.CSSProperties}
      className={cn(
        "m-0 flex-col overflow-hidden border border-line bg-surface p-0 text-ink shadow-float",
        "transition-[translate,display,overlay] transition-discrete open:flex",
        "duration-150 ease-out open:duration-200",
        "backdrop:bg-black/40 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay]",
        "backdrop:transition-discrete backdrop:duration-150 open:backdrop:opacity-100",
        // md+: fixed panel on the right, slides in from its own width.
        "md:fixed md:right-0 md:left-auto md:z-30 md:w-(--drawer-w) md:max-w-none",
        "md:top-[calc(3.5rem+var(--safe-top))] md:bottom-0 md:h-auto md:max-h-none md:translate-x-full md:border-y-0 md:border-r-0",
        "md:open:translate-x-0 starting:md:open:translate-x-full",
        // Below md: tall bottom sheet.
        "max-md:fixed max-md:inset-x-0 max-md:top-[16%] max-md:bottom-0 max-md:h-auto max-md:max-h-none max-md:pb-[env(safe-area-inset-bottom)]",
        "max-md:w-full max-md:max-w-none max-md:translate-y-full max-md:border-x-0 max-md:border-b-0",
        "max-md:open:translate-y-0 starting:max-md:open:translate-y-full",
        className,
      )}
    >
      <div className="flex items-center gap-2 py-2 pr-1 pl-4 md:pr-2 md:pl-5">
        <h2 id={`${id}-title`} className="min-w-0 flex-1 truncate heading-sm">
          {title}
        </h2>
        <IconButton label={closeLabel} onClick={onClose}>
          <X size={20} aria-hidden />
        </IconButton>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </dialog>
  );
}
