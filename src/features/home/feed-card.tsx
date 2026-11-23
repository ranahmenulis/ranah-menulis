import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The card around a feed (DESIGN.md 6.2): Beranda, Tersimpan and the profile Karya tab. */
export const feedCardClass =
  "overflow-hidden rounded-2xl border border-line bg-surface shadow-card";

/**
 * The entries inside a feed card: side padding, and no line under the last entry (the card edge
 * closes the list).
 */
export function FeedList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "px-5 md:px-6 [&>article:last-child]:border-b-0 [&>div:last-child]:border-b-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
