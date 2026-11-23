import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/** The accent disc in front of a card heading; decorative. */
export function SectionIcon({ icon: Icon }: { icon: PhosphorIcon }) {
  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent-ink"
    >
      <Icon size={18} weight="bold" />
    </span>
  );
}

/**
 * A titled card (DESIGN.md 4.5, 6.7): the heading carries one accent icon, like "Target Kebiasaan"
 * in the client's Streak reference. `action` sits at the right of the heading (a small pill button).
 * Used by Projects and Community.
 */
export function Section({
  title,
  icon: Icon,
  action,
  id,
  className,
  children,
}: {
  title: ReactNode;
  icon?: PhosphorIcon;
  action?: ReactNode;
  /** Id of the heading; the section is labelled by it. */
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const heading = (
    <h2 id={id} className="flex min-w-0 items-center gap-2.5 heading-md">
      {Icon && <SectionIcon icon={Icon} />}
      <span className="min-w-0 wrap-anywhere">{title}</span>
    </h2>
  );
  return (
    <section aria-labelledby={id} className={cn(cardClass, "grid min-w-0 gap-4", className)}>
      {action ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {heading}
          {action}
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  );
}
