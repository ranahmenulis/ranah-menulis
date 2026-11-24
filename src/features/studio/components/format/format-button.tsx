"use client";

import type { ReactNode } from "react";

type ButtonProps = {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function FormatButton({ label, pressed, onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      // Keep the caret and selection: do not let the toolbar take focus from the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-9 w-10 flex-none cursor-pointer place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-ink aria-pressed:bg-accent-subtle aria-pressed:text-accent-ink md:h-8 md:w-9"
    >
      {children}
    </button>
  );
}
