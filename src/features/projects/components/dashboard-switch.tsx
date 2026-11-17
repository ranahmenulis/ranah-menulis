"use client";

import { ClassDashboard } from "../kelas/components/class-dashboard";
import { SoloDashboard } from "../solo/components/solo-dashboard";
import { useProjects } from "../use-projects";
import { MySkeleton } from "./my-states";

/**
 * Solo and Kelas share one address (`/dasbor`). The category is read on this device, because a
 * project an Organizer wrote exists only here and the server cannot see it.
 */
export function DashboardSwitch({ slug }: { slug: string }) {
  const data = useProjects();
  if (data.status === "loading") return <MySkeleton label="Memuat dasbor" />;
  const project = data.projects.find((p) => p.slug === slug && p.publication === "terbit");
  return project?.category === "solo" ? (
    <SoloDashboard slug={slug} />
  ) : (
    <ClassDashboard slug={slug} />
  );
}
