"use client";

import { useT } from "@/lib/i18n/provider";
import { ClassDashboard } from "../kelas/components/class-dashboard";
import { SoloDashboard } from "../solo/components/solo-dashboard";
import { useProjects } from "../use-projects";
import { MySkeleton } from "./my-states";

/**
 * Solo and Kelas share one address (`/dasbor`). The category is read on this device, because a
 * project an Organizer wrote exists only here and the server cannot see it.
 */
export function DashboardSwitch({ slug }: { slug: string }) {
  const t = useT().projectsCatalog;
  const data = useProjects();
  if (data.status === "loading") return <MySkeleton label={t.screens.loadingDashboard} />;
  const project = data.projects.find((p) => p.slug === slug && p.publication === "terbit");
  return project?.category === "solo" ? (
    <SoloDashboard slug={slug} />
  ) : (
    <ClassDashboard slug={slug} />
  );
}
