"use client";

import Link from "next/link";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { areasFor } from "../access";

/** /kelola: one line per area the viewer can open. The frame has already refused everyone else. */
export function KelolaOverview() {
  const areas = areasFor(useEffectiveRoles());
  return (
    <section aria-labelledby="kelola-title" className="max-w-170">
      <h1 id="kelola-title" className="heading-lg">
        Kelola
      </h1>
      <ul className="mt-6 border-t border-line">
        {areas.map((area) => (
          <li key={area.id} className="border-b border-line">
            <Link href={area.href} className="grid gap-1 py-4 no-underline hover:bg-subtle">
              <span className="heading-sm">{area.label}</span>
              <span className="text-sm text-ink-muted">{area.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
