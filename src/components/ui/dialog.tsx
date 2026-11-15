"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSheetDrag } from "@/lib/use-sheet-drag";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, primary last. Stacked with the primary on top on small screens. */
  actions: ReactNode;
  /**
   * When false, neither Escape, the backdrop, nor a close button dismisses the dialog; the only
   * way out is an action (conflict dialog, BR-STD-04).
   */
  dismissible?: boolean;
  /** "wide" is for side-by-side comparison (max 960). */
  size?: "md" | "wide";
  /** Small screens: a full page instead of a bottom sheet. */
  fullPageOnMobile?: boolean;
  role?: "dialog" | "alertdialog";
  /**
   * Small screens: show a grabber and let a swipe down on the grabber or title close the sheet. Only
   * for dialogs that are dismissible; ignored when `dismissible` is false.
   */
  swipeToDismiss?: boolean;
};

/**
 * Modal built on the native <dialog>: focus is trapped, the page behind is inert, Escape works and
 * focus returns to the trigger. Desktop is a centered 480px panel (DESIGN.md 7.1); small screens are
 * a bottom sheet. Open 200ms ease-out, close faster; both are transitions so they can be interrupted.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  dismissible = true,
  size = "md",
  fullPageOnMobile = false,
  role = "dialog",
  swipeToDismiss = false,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const swipe = swipeToDismiss && dismissible;
  const drag = useSheetDrag(ref, swipe, onClose);
  const { reset } = drag;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      reset(); // a sheet swiped away keeps its offset until it opens again
      el.showModal();
    } else if (!open && el.open) el.close();
  }, [open, reset]);

  const heading = (
    <h2 id={`${id}-title`} className="heading-md">
      {title}
    </h2>
  );

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onCancel={(e) => {
        // Keep React state as the single source of truth for open/closed.
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-3rem)] w-full overflow-auto border border-line bg-surface p-0 text-ink shadow-float",
        "opacity-0 transition-[opacity,translate,scale,display,overlay] transition-discrete",
        "duration-150 ease-out open:opacity-100 open:duration-200 starting:open:opacity-0",
        "backdrop:bg-black/40 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay]",
        "backdrop:transition-discrete backdrop:duration-150 open:backdrop:opacity-100",
        "open:backdrop:duration-200 starting:open:backdrop:opacity-0",
        // Desktop: centered, scales from the center (modals are not anchored to a trigger).
        "md:scale-[0.97] md:open:scale-100 starting:md:open:scale-[0.97]",
        size === "wide" ? "md:w-[min(960px,calc(100vw-3rem))]" : "md:max-w-120",
        // Small screens: bottom sheet, or a full page.
        "max-md:mb-0 max-md:max-w-none max-md:translate-y-full max-md:border-x-0 max-md:border-b-0",
        "max-md:open:translate-y-0 starting:max-md:open:translate-y-full",
        fullPageOnMobile && "max-md:h-dvh max-md:max-h-none max-md:border-0",
      )}
    >
      <div
        className={cn(
          "grid gap-4 p-6 max-md:px-4 max-md:pb-[calc(1rem+env(safe-area-inset-bottom))]",
          fullPageOnMobile &&
            "max-md:min-h-dvh max-md:grid-rows-[auto_auto_1fr_auto] max-md:pt-[calc(1.5rem+var(--safe-top))]",
          size === "wide" && "md:gap-5 md:p-7",
        )}
      >
        {swipe ? (
          <div
            {...drag.handlers}
            className="grid touch-none gap-4 max-md:-mx-4 max-md:-mt-4 max-md:px-4 max-md:pt-2.5"
          >
            <span aria-hidden className="mx-auto h-1 w-9 rounded-full bg-ink-faint md:hidden" />
            {heading}
          </div>
        ) : (
          heading
        )}
        {description && (
          <p id={`${id}-desc`} className="text-sm leading-[22px] text-ink-muted">
            {description}
          </p>
        )}
        {children}
        <div
          className={cn(
            "flex flex-wrap justify-end gap-2 max-md:flex-col-reverse max-md:[&>*]:w-full",
            fullPageOnMobile &&
              "max-md:sticky max-md:bottom-0 max-md:-mx-4 max-md:border-t max-md:border-line max-md:bg-surface max-md:px-4 max-md:pt-3",
          )}
        >
          {actions}
        </div>
      </div>
    </dialog>
  );
}
