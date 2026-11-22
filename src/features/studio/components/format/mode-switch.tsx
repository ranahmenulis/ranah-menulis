"use client";

import { BookOpen, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { useT } from "@/lib/i18n/provider";
import type { ViewMode } from "../../hooks/use-view-mode";

/**
 * Writing Mode and Page Preview. A fill marks the current mode (the only filled control in the
 * row); both buttons keep their place so the toolbar does not jump when the mode changes.
 */
export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const t = useT().studioLayout.mode;
  const options = [
    { value: "write" as const, label: t.write, title: t.writeTitle, Icon: PencilSimple },
    { value: "preview" as const, label: t.preview, title: t.previewTitle, Icon: BookOpen },
  ];
  return (
    <div
      role="group"
      aria-label={t.label}
      className="inline-flex flex-none rounded-full border border-line p-0.5 text-sm"
    >
      {options.map(({ value, label, title, Icon }) => (
        <button
          key={value}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className="grid h-8 min-w-9 cursor-pointer place-items-center rounded-full px-2 text-ink hover:opacity-(--opacity-hover) aria-pressed:bg-ink aria-pressed:text-canvas md:h-7 md:px-3"
        >
          {/* Phones only have room for an icon; the name stays in the label for screen readers. */}
          <Icon size={18} aria-hidden className="md:hidden" />
          <span className="max-md:sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
