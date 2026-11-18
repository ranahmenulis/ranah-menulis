"use client";

import { useMemo } from "react";
import { featuredProjects } from "../featured-store";
import type { Filters, Project } from "../types";

/** True when a status or fee filter narrows the list. */
export const narrowedBy = (f: Filters) => f.state !== "semua" || f.fee !== "semua";

/**
 * Splits the catalog into the "Unggulan" block and the rest. The block shows only while nothing
 * narrows the page, in the order the projects were marked, and only published ones.
 */
export function useFeaturedSplit(list: Project[], filters: Filters) {
  const marked = featuredProjects.use();
  const unfiltered = filters.category === "semua" && !narrowedBy(filters);
  return useMemo(() => {
    const featured = unfiltered
      ? marked.flatMap((m) => list.filter((p) => p.slug === m.slug && p.publication === "terbit"))
      : [];
    const rest = featured.length === 0 ? list : list.filter((p) => !featured.includes(p));
    return { featured, rest };
  }, [unfiltered, marked, list]);
}
