import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

/**
 * A group of form fields in a card (DESIGN.md 7.8): a fieldset whose legend carries one accent
 * icon. The card is a wrapper, because a border on the fieldset itself is cut by its legend.
 */
export function FieldGroup({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon: Icon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(cardClass, "min-w-0", className)}>
      <fieldset className="grid min-w-0 gap-4">
        <legend className="mb-4 flex items-center gap-2.5 heading-md">
          <SectionIcon icon={icon} />
          {title}
        </legend>
        {children}
      </fieldset>
    </div>
  );
}
