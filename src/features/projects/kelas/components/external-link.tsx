import type { ReactNode } from "react";

/**
 * A link to a service outside RanahMenulis (a meeting, a recording; Q-26: the platform hosts
 * neither). Opens in a new tab and says so to a screen reader.
 */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-ink underline underline-offset-3"
    >
      {children}
      <span className="sr-only"> (tab baru, layanan di luar RanahMenulis)</span>
    </a>
  );
}
