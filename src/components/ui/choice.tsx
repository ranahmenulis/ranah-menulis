import { Check } from "@phosphor-icons/react/dist/ssr";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type RadioChoiceProps = Omit<ComponentProps<"input">, "type" | "children"> & {
  label: ReactNode;
  /** Small muted line under the label. */
  hint?: ReactNode;
};

/**
 * One option of a radio group: ring with an ink dot, label beside it, an optional hint under the
 * label. The whole row is the click target. Group the options in a fieldset or role="radiogroup".
 */
export function RadioChoice({ label, hint, className, ...props }: RadioChoiceProps) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input
        type="radio"
        className={cn(
          "mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-ink bg-canvas",
          "checked:bg-ink checked:shadow-[inset_0_0_0_4px_var(--canvas)]",
          "disabled:cursor-default disabled:opacity-(--opacity-disabled)",
        )}
        {...props}
      />
      <span className="grid min-w-0 gap-0.5">
        <span className="text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Square selection mark for lists where a row is chosen as a whole (the block picker). */
export function CheckMark({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid size-5 shrink-0 place-items-center border",
        checked ? "border-ink bg-ink text-on-ink" : "border-line-strong bg-canvas text-transparent",
        className,
      )}
    >
      <Check size={14} weight="bold" />
    </span>
  );
}
