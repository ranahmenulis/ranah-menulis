"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/provider";

/**
 * A link to a service outside RanahMenulis (a meeting, a recording; Q-26: the platform hosts
 * neither). Opens in a new tab and says so to a screen reader.
 */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const t = useT().projectsClass;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-ink underline underline-offset-3"
    >
      {children}
      <span className="sr-only"> {t.external}</span>
    </a>
  );
}
