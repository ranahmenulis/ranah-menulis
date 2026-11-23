import { cn } from "@/lib/cn";

/**
 * An on/off control for a setting that saves at once. It stays a checkbox for assistive
 * technology (its label is read from `label`, visually hidden because the row already shows it);
 * it looks like a switch so the row reads "on" or "off" at a glance.
 */
export function Switch({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-150",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:opacity-(--opacity-disabled)",
          checked ? "bg-accent" : "bg-ink-muted/35",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-card transition-transform duration-150",
            checked && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
}
