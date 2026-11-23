"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  /** Tailwind width of the control, so the toolbar does not jump when the choice changes. */
  widthClass: string;
};

/**
 * A native select sized for the format toolbar. Native on purpose: it opens a proper picker on
 * phones and works with the keyboard without extra code. It takes focus (unlike the buttons);
 * the editor keeps its selection and gets focus back when a command runs.
 */
export function ToolbarSelect({ label, value, options, onChange, widthClass }: Props) {
  return (
    <span className="relative flex-none">
      <select
        aria-label={label}
        title={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rm-select h-9 cursor-pointer appearance-none truncate rounded-full bg-transparent pr-7 pl-3 text-sm text-ink transition-colors duration-150 hover:bg-subtle md:h-8",
          widthClass,
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted"
      />
    </span>
  );
}
