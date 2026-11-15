import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Frame of a still mockup: the same border and surface as LoopFrame, without the loop. The
 * picture is one image for assistive tech; its label describes what it shows.
 */
export function PreviewFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn("m-0 min-w-0 overflow-hidden border border-line bg-canvas", className)}
    >
      {children}
    </figure>
  );
}

/** Small pill tag beside a title or inside a mockup ("Menyusul", "Bagian dari Studio"). */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full border border-line px-2.5 text-xs font-medium whitespace-nowrap text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
