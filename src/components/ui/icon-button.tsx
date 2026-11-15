import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> & {
  /** Required: icon-only controls must have an accessible name (DESIGN.md 4.7). Also used as tooltip. */
  label: string;
};

/** Round icon button. 44px on touch widths, 40px from md up. Active/open state darkens the icon. */
export function IconButton({ label, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-full md:size-10",
        "text-ink-muted hover:text-ink aria-expanded:text-ink aria-pressed:text-ink",
        "transition-colors duration-120 disabled:cursor-default disabled:opacity-(--opacity-disabled)",
        className,
      )}
      {...props}
    />
  );
}
