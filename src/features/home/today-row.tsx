import type { ReactNode } from "react";

/**
 * One section of the Beranda side column (Medium's right column): a small heading, then its lines.
 * Sections are parted by a strong hairline; lines inside one section use the light one, so the
 * eye can tell a new section from a new line (user feedback, 20 November 2026). No boxes.
 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="grid gap-3 border-t border-line-strong py-5 first:border-t-0 first:pt-0"
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export const sub = "mt-0.5 text-xs text-ink-muted";
