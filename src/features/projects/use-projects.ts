"use client";

import { useEffect, useMemo, useState } from "react";
import { projectFixtures } from "./fixtures/all-projects";
import { resolveProjects } from "./project-model";
import type { Project, ProjectFixture } from "./types";

export type ProjectsData =
  { status: "loading" } | { status: "ready"; now: number; projects: Project[] };

/**
 * Dummy projects, resolved against the time the page opened. The clock is read in an effect
 * because Next 16 prerender rejects `Date.now()` during render. The data itself is synchronous,
 * so there is no error state yet; add one when projects come from the server.
 */
export function useProjects(source: ProjectFixture[] = projectFixtures): ProjectsData {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Read in a microtask: the clock must not be read during render, and React flags a
    // synchronous setState in an effect body.
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setNow(Date.now());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () =>
      now === null
        ? { status: "loading" }
        : { status: "ready", now, projects: resolveProjects(source, now) },
    [now, source],
  );
}
