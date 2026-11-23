import type { ReactNode } from "react";

/**
 * One section of the Beranda side column: a small heading, then its lines, in its own card
 * (DESIGN.md 4.5, tahap C 23 November 2026). A section with nothing to say is not drawn, so the
 * column never holds an empty card.
 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="grid gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card"
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export const sub = "mt-0.5 text-xs text-ink-muted";
