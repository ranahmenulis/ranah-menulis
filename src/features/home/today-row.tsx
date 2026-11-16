import type { ReactNode } from "react";

/** One labelled row of the "Hari ini" block: a line above, no box (DESIGN.md 6.2). */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-2 border-b border-line py-4 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:py-5">
      <p className="col-span-full pt-0.5 text-xs font-medium text-ink-muted md:col-span-1 md:text-sm">
        {label}
      </p>
      {children}
    </div>
  );
}

export const sub = "mt-1 text-sm text-ink-muted";
