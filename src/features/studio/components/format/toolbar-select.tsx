"use client";

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
    <select
      aria-label={label}
      title={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 flex-none cursor-pointer rounded-full bg-canvas px-2 text-sm text-ink hover:opacity-(--opacity-hover) md:h-8 ${widthClass}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
