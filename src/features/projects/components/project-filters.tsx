"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useId, useRef, useState, type Ref } from "react";
import { Chip } from "@/components/ui/chip";
import { RadioChoice } from "@/components/ui/choice";
import { Popover } from "@/components/ui/popover";
import { StickyChipBar } from "@/components/ui/sticky-chip-bar";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { CATEGORIES, FEE_FILTERS, STATE_FILTERS } from "../project-model";
import type { Filters } from "../types";

type Props = { filters: Filters; onChange: (next: Filters) => void };

/** The category chips, with the status and fee menus on the same sticky row. */
export function CategoryBar({ filters, onChange }: Props) {
  const t = useT().projectsCatalog;
  return (
    <StickyChipBar
      label={t.filters.category}
      end={<ProjectFilters filters={filters} onChange={onChange} />}
    >
      {CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          pressed={c.id === filters.category}
          onClick={() => onChange({ ...filters, category: c.id })}
          className="shrink-0"
        >
          {t.categories[c.id].label}
        </Chip>
      ))}
    </StickyChipBar>
  );
}

type Option<T extends string> = { id: T; label: string };

/** "Status" while nothing is narrowed, "Status: Buka" once something is. */
export function menuLabel<T extends string>(title: string, options: Option<T>[], value: T) {
  const picked = options.find((o) => o.id === value);
  return value === options[0].id || !picked ? title : `${title}: ${picked.label}`;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * One single-choice filter behind a chip-shaped button. Picking with the mouse applies and closes;
 * arrow keys move the choice and keep the panel open, Escape closes and returns focus.
 */
function FilterMenu<T extends string>({
  title,
  options,
  value,
  onPick,
}: {
  title: string;
  options: Option<T>[];
  value: T;
  onPick: (id: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  // Set by a pointer press inside the panel: that pick is a decision, a key press only moves.
  const pointer = useRef(false);
  const name = useId();
  const narrowed = value !== options[0].id;
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label={title}
      panelClassName="w-56 p-4 max-md:right-auto max-md:left-0 max-md:origin-top-left"
      renderTrigger={(props) => (
        <button
          type="button"
          ref={(el) => {
            trigger.current = el;
            setRef(props.ref, el);
          }}
          aria-expanded={props["aria-expanded"]}
          aria-controls={props["aria-controls"]}
          aria-haspopup="dialog"
          onClick={props.onClick}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm whitespace-nowrap",
            narrowed ? "bg-ink text-on-ink" : "bg-subtle text-ink hover:bg-line",
          )}
        >
          {menuLabel(title, options, value)}
          <CaretDown size={14} aria-hidden />
        </button>
      )}
    >
      <div
        role="radiogroup"
        aria-label={title}
        className="grid gap-3"
        onPointerDown={() => (pointer.current = true)}
        onKeyDown={() => (pointer.current = false)}
      >
        {options.map((o) => (
          <RadioChoice
            key={o.id}
            name={name}
            label={o.label}
            checked={o.id === value}
            onChange={() => {
              onPick(o.id);
              if (!pointer.current) return;
              pointer.current = false;
              setOpen(false);
              trigger.current?.focus();
            }}
          />
        ))}
      </div>
    </Popover>
  );
}

/** Status and fee: two single-choice menus beside the category chips. */
export function ProjectFilters({ filters, onChange }: Props) {
  const t = useT().projectsCatalog;
  const states = STATE_FILTERS.map((o) => ({ id: o.id, label: t.stateFilters[o.id] }));
  const fees = FEE_FILTERS.map((o) => ({ id: o.id, label: t.feeFilters[o.id] }));
  return (
    <>
      <FilterMenu
        title={t.filters.status}
        options={states}
        value={filters.state}
        onPick={(state) => onChange({ ...filters, state })}
      />
      <FilterMenu
        title={t.filters.fee}
        options={fees}
        value={filters.fee}
        onPick={(fee) => onChange({ ...filters, fee })}
      />
    </>
  );
}
