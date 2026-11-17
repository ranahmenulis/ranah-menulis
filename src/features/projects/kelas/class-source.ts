"use client";

import { useMemo } from "react";
import type { ProjectFixture } from "../types";
import { useCatalog } from "../use-catalog";
import { classFixtures } from "./fixtures/all";
import type { ClassFixture } from "./types";

/**
 * Every Kelas project has a class behind it. One an Organizer wrote has no curriculum yet, so it
 * gets an empty one: the dashboard opens and says nothing is filled in, and the mentor can add
 * tasks (KLS-03). The sessions and materials are written elsewhere [usulan, 6g-3a].
 */
export function classesFor(
  catalog: readonly ProjectFixture[],
  base: ClassFixture[] = classFixtures,
): ClassFixture[] {
  const missing = catalog.filter(
    (p) => p.category === "kelas" && !base.some((c) => c.slug === p.slug),
  );
  return missing.length === 0
    ? base
    : [...base, ...missing.map((p) => ({ slug: p.slug, sessions: [], modules: [] }))];
}

export function useClassFixtures(): ClassFixture[] {
  const catalog = useCatalog();
  return useMemo(() => classesFor(catalog), [catalog]);
}
