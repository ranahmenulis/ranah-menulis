"use client";

import { Notice } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import type { AreaInfo } from "../access";

/** Stands in for an area until its own screens exist (6g-1 onwards); the frame guards access. */
export function AreaPlaceholder({ area }: { area: AreaInfo }) {
  const t = useT().kelolaShared;
  const text = t.areas[area.id];
  return (
    <section aria-labelledby="area-title" className="grid max-w-170 gap-4">
      <h1 id="area-title" className="heading-lg">
        {text.label}
      </h1>
      <p className="text-sm text-ink-muted">{text.summary}</p>
      <Notice>{t.placeholder.notOpen}</Notice>
    </section>
  );
}
