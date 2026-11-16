import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * One block of the Settings page: a heading, an optional line under it, then its content, set off
 * by a hairline above. The danger block colours only its heading (red is for irreversible actions).
 */
export function SettingsSection({
  id,
  title,
  subtitle,
  danger = false,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-5 border-t border-line pt-8">
      <header className="grid gap-1">
        <h2 id={`${id}-title`} className={cn("heading-md", danger && "text-danger")}>
          {title}
        </h2>
        {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
