"use client";

import { DotsThree } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/use-dismiss";
import { Button } from "./button";
import { IconButton } from "./icon-button";

export type MenuEntry =
  | {
      type?: "item";
      id: string;
      label: string;
      icon?: ReactNode;
      /** Small muted text on the right, e.g. "Bisa dipulihkan". */
      hint?: string;
      onSelect: () => void;
      /** Not available yet; stays visible so the menu keeps its final shape. */
      disabled?: boolean;
      /** Only for actions that cannot be undone. Everything else stays ink (DESIGN.md 4.1). */
      danger?: boolean;
      /** Shown only in the small-screen sheet (e.g. controls that do not fit the narrow bar). */
      mobileOnly?: boolean;
    }
  | { type: "separator"; id: string; mobileOnly?: boolean };

type MenuProps = {
  items: MenuEntry[];
  /** Accessible name of the trigger and of the menu. */
  label: string;
  icon?: ReactNode;
  className?: string;
};

/**
 * "⋯" menu. md and up: a popover under the trigger, scaling from the trigger corner. Below md: a
 * bottom sheet over a scrim, with 48px rows. Arrow keys move, Home/End jump, Escape closes.
 */
export function Menu({ items, label, icon, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useDismiss(open, (reason) => close(reason === "escape"), wrapRef);

  function visibleItems() {
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:enabled');
    return Array.from(nodes ?? []).filter((n) => n.offsetParent !== null);
  }

  function toggle() {
    if (open) return close(false);
    setOpen(true);
    // Wait for visibility to apply before moving focus into the panel.
    requestAnimationFrame(() => visibleItems()[0]?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const list = visibleItems();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const target =
      e.key === "ArrowDown"
        ? list[(index + 1) % list.length]
        : e.key === "ArrowUp"
          ? list[(index - 1 + list.length) % list.length]
          : e.key === "Home"
            ? list[0]
            : e.key === "End"
              ? list[list.length - 1]
              : null;
    if (e.key === "Tab") return close(false);
    if (!target) return;
    e.preventDefault();
    target.focus();
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <IconButton
        ref={triggerRef}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={toggle}
      >
        {icon ?? <DotsThree size={20} weight="bold" aria-hidden />}
      </IconButton>

      <div
        aria-hidden={!open}
        onClick={() => close(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 md:hidden",
          open ? "opacity-100 duration-200" : "pointer-events-none invisible opacity-0",
        )}
      />

      <div
        ref={panelRef}
        id={id}
        role="menu"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          "z-50 border border-line bg-surface py-1.5 shadow-float",
          "transition-[opacity,translate,scale,visibility] duration-100 ease-out",
          // Small screens: bottom sheet.
          "fixed inset-x-0 bottom-0 border-x-0 border-b-0 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]",
          // md+: popover under the trigger, aligned to its right edge.
          "md:absolute md:inset-x-auto md:top-[calc(100%+4px)] md:right-0 md:bottom-auto md:min-w-55",
          "md:origin-top-right md:border md:p-0 md:py-1.5",
          open
            ? "visible translate-y-0 opacity-100 duration-200 md:scale-100"
            : "invisible translate-y-full opacity-0 max-md:pointer-events-none md:translate-y-0 md:scale-[0.97]",
        )}
      >
        {items.map((entry) =>
          entry.type === "separator" ? (
            <div
              key={entry.id}
              role="separator"
              className={cn("my-1.5 h-px bg-line", entry.mobileOnly && "md:hidden")}
            />
          ) : (
            <button
              key={entry.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={entry.disabled}
              onClick={() => {
                close(true);
                entry.onSelect();
              }}
              className={cn(
                "flex h-12 w-full cursor-pointer items-center gap-2.5 px-1 text-left text-[15px]",
                "hover:bg-subtle focus-visible:bg-subtle md:h-9 md:px-3.5 md:text-sm",
                "disabled:cursor-default disabled:opacity-(--opacity-disabled) disabled:hover:bg-transparent",
                entry.danger ? "text-danger" : "text-ink",
                entry.mobileOnly && "md:hidden",
              )}
            >
              {entry.icon && <span className="shrink-0 [&>svg]:size-5">{entry.icon}</span>}
              <span className="min-w-0 flex-1 truncate">{entry.label}</span>
              {entry.hint && <span className="text-xs text-ink-muted">{entry.hint}</span>}
            </button>
          ),
        )}
        <Button variant="secondary" className="mt-3 w-full md:hidden" onClick={() => close(true)}>
          Tutup
        </Button>
      </div>
    </div>
  );
}
