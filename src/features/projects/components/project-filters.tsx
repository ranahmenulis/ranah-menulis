"use client";

import { Chip } from "@/components/ui/chip";
import { StickyChipBar } from "@/components/ui/sticky-chip-bar";
import { CATEGORIES, FEE_FILTERS, STATE_FILTERS } from "../project-model";
import type { Filters } from "../types";

type Props = { filters: Filters; onChange: (next: Filters) => void };

export function CategoryBar({ filters, onChange }: Props) {
  return (
    <StickyChipBar label="Kategori">
      {CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          pressed={c.id === filters.category}
          onClick={() => onChange({ ...filters, category: c.id })}
          className="shrink-0"
        >
          {c.label}
        </Chip>
      ))}
    </StickyChipBar>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="scroll-edge-fade -mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}

/** Status and fee: two single-choice groups under the category bar. */
export function ProjectFilters({ filters, onChange }: Props) {
  return (
    <div className="grid gap-2 pt-4">
      <ChipRow label="Status">
        {STATE_FILTERS.map((s) => (
          <Chip
            key={s.id}
            pressed={s.id === filters.state}
            onClick={() => onChange({ ...filters, state: s.id })}
            className="shrink-0"
          >
            {s.label}
          </Chip>
        ))}
      </ChipRow>
      <ChipRow label="Biaya">
        {FEE_FILTERS.map((f) => (
          <Chip
            key={f.id}
            pressed={f.id === filters.fee}
            onClick={() => onChange({ ...filters, fee: f.id })}
            className="shrink-0"
          >
            {f.label}
          </Chip>
        ))}
      </ChipRow>
    </div>
  );
}
