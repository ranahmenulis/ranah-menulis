"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * An empty Community list (DESIGN.md 7.10, 8): the section's own illustration in small, one
 * sentence and one way out, like the empty Beranda feed. Sits inside a card or stands as one.
 */
export function CommunityEmpty({
  art: Art,
  children,
  action,
  card = false,
}: {
  art: (props: { className?: string }) => ReactNode;
  children: ReactNode;
  action?: ReactNode;
  /** Draw its own card (when it is not already inside one). */
  card?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid justify-items-start gap-3",
        card ? "rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6" : "py-2",
      )}
    >
      <div className="h-28 w-full max-w-64 overflow-hidden rounded-xl bg-subtle" aria-hidden>
        <Art className="size-full" />
      </div>
      <p className="font-serif text-xl leading-7 font-semibold">{children}</p>
      {action}
    </div>
  );
}
