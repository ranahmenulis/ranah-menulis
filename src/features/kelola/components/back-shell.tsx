import type { ReactNode } from "react";
import { TextLink } from "@/components/ui/text-link";

/** One column with the way out always on top (Organizer and Mentor screens). */
export function BackShell({
  back,
  children,
  wide = false,
  full = false,
}: {
  back: { href: string; label: string };
  children: ReactNode;
  wide?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`mx-auto grid gap-6 ${full ? "max-w-320" : wide ? "max-w-260" : "max-w-170"}`}>
      <TextLink
        href={back.href}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        {back.label}
      </TextLink>
      {children}
    </div>
  );
}
