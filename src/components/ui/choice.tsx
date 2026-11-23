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

/**
 * The check box drawn beside a hidden checkbox (CheckChoice, the block picker, the notification
 * table). Checked fills with the accent and the tick draws itself in (stroke offset, 180ms, after a
 * short delay so the fill leads); unchecking wipes it out faster. The box gives a little under the
 * pointer while its label is pressed. Transitions, not keyframes, so a quick double click reverses
 * mid-way; reduced motion switches straight.
 */
export function CheckMark({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
        "transition-[background-color,border-color,transform] duration-150 ease-out in-active:scale-90 motion-reduce:transition-none",
        checked
          ? "border-accent bg-accent text-on-accent"
          : "border-line-strong bg-surface text-transparent in-hover:border-accent",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          pathLength={1}
          stroke={checked ? "currentColor" : "var(--color-on-accent)"}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={checked ? 0 : 1}
          className={cn(
            "motion-safe:transition-[stroke-dashoffset] motion-reduce:transition-none",
            checked ? "duration-200 ease-out motion-safe:delay-75" : "duration-100 ease-in",
          )}
        />
      </svg>
    </span>
  );
}

type CheckChoiceProps = Omit<ComponentProps<"input">, "type" | "children" | "checked"> & {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
};

/**
 * One yes/no statement ("Saya menyetujui ..."): a square mark that fills with ink, label beside it.
 * The input is the real control (hidden visually); the mark shows its state and its keyboard focus.
 */
export function CheckChoice({ label, hint, checked, className, ...props }: CheckChoiceProps) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input type="checkbox" checked={checked} className="peer sr-only" {...props} />
      <CheckMark
        checked={checked}
        className="peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:opacity-(--opacity-disabled)"
      />
      <span className="grid min-w-0 gap-0.5">
        <span className="text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}
