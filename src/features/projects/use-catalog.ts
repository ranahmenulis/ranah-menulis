"use client";

import { useMemo } from "react";
import { projectFixtures } from "./fixtures/all-projects";
import { storedProjects } from "./stored-projects";
import type { ProjectFixture } from "./types";

/** The sample projects followed by those Organizers wrote on this device (the one join point). */
export function mergeCatalog(
  stored: readonly ProjectFixture[],
  samples: ProjectFixture[] = projectFixtures,
): ProjectFixture[] {
  const fresh = stored.filter((s) => !samples.some((p) => p.slug === s.slug));
  return fresh.length === 0 ? samples : [...samples, ...fresh];
}

/** Same array between renders until something is stored, so memo dependencies stay stable. */
export function useCatalog(): ProjectFixture[] {
  const stored = storedProjects.use();
  return useMemo(() => mergeCatalog(stored), [stored]);
}
