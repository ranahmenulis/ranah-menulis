"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { featuredRemoteSync } from "./storage/remote/remote-project-lists";

/** A project an Administrator marked "unggulan" (PRD 17.5). List order is the order marked. */
export type FeaturedProject = { slug: string; at: number };

const isFeatured = (value: unknown): value is FeaturedProject => {
  if (typeof value !== "object" || value === null) return false;
  const f = value as Record<string, unknown>;
  return typeof f.slug === "string" && Number.isFinite(f.at);
};

export const featuredProjects = createLocalListStore<FeaturedProject>(
  "ranah.featuredProjects",
  isFeatured,
  [],
  featuredRemoteSync,
);
