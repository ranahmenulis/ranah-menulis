import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * One line of a settings card: what it is on the left (a label and one sentence), the control on
 * the right; stacked on phones. Rows in one card are divided by hairlines.
 */
export function SettingRow({
  label,
  hint,
  labelFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  /** Id of the control, when the label should name it. */
  labelFor?: string;
  children: ReactNode;
  className?: string;
}) {
  const Label = labelFor ? "label" : "p";
  return (
    <div
      className={cn(
        "grid gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6",
        className,
      )}
    >
      <div className="grid min-w-0 gap-0.5">
        <Label htmlFor={labelFor} className="text-sm font-medium text-ink">
          {label}
        </Label>
        {hint && <p className="text-sm text-ink-muted">{hint}</p>}
      </div>
      <div className="min-w-0 sm:justify-self-end">{children}</div>
    </div>
  );
}

/** The rows of one card. */
export function SettingRows({ children }: { children: ReactNode }) {
  return <div className="grid gap-4">{children}</div>;
}
