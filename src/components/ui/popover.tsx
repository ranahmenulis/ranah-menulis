"use client";

import { useCallback, useId, useRef, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/use-dismiss";

type TriggerProps = {
  ref: Ref<HTMLButtonElement>;
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: () => void;
};

type PopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderTrigger: (props: TriggerProps) => ReactNode;
  /** Accessible name of the panel. */
  label: string;
  children: ReactNode;
  /** Classes for the wrapper that anchors the panel (use `max-md:static` to anchor to a parent). */
  className?: string;
  /** Classes for the panel: width, alignment, and offset. */
  panelClassName?: string;
};

/**
 * Small floating panel that opens from a trigger button (save-state explanation, daily target
 * breakdown). Floating layer per DESIGN.md 4.5: `surface`, 1px border, shadow in light mode only.
 * Enters with a short fade and slight scale from the trigger corner; leaves instantly.
 */
export function Popover({
  open,
  onOpenChange,
  renderTrigger,
  label,
  children,
  className,
  panelClassName,
}: PopoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const dismiss = useCallback(
    (reason: "escape" | "outside") => {
      onOpenChange(false);
      if (reason === "escape") triggerRef.current?.focus();
    },
    [onOpenChange],
  );
  useDismiss(open, dismiss, wrapRef);

  return (
    <div ref={wrapRef} className={cn("relative inline-flex", className)}>
      {renderTrigger({
        ref: triggerRef,
        "aria-expanded": open,
        "aria-controls": open ? id : undefined,
        onClick: () => onOpenChange(!open),
      })}
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute top-[calc(100%+12px)] right-0 z-50 border border-line bg-surface whitespace-normal shadow-float",
            "origin-top-right transition-[opacity,scale] duration-150 ease-out",
            "starting:scale-[0.97] starting:opacity-0",
            panelClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
