import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

/**
 * One block of the Settings page (DESIGN.md 4.5): a card whose heading carries one accent icon, an
 * optional line under it, then its content. The danger block is a card with a soft red edge and
 * colours its heading and icon (red is for irreversible actions). `id` is also the anchor the
 * section menu scrolls to.
 */
export function SettingsSection({
  id,
  title,
  subtitle,
  icon,
  danger = false,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: PhosphorIcon;
  danger?: boolean;
  children: ReactNode;
}) {
  const Icon = icon;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        cardClass,
        "grid min-w-0 scroll-mt-[calc(5rem+var(--safe-top))] gap-5",
        danger && "border-danger/40",
      )}
    >
      <header className="grid gap-1">
        <h2
          id={`${id}-title`}
          className={cn("flex items-center gap-2.5 heading-md", danger && "text-danger")}
        >
          {danger ? (
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-danger-subtle text-danger"
            >
              <Icon size={18} weight="bold" />
            </span>
          ) : (
            <SectionIcon icon={icon} />
          )}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-ink-muted md:pl-[2.625rem]">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
