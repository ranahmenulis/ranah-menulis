import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { ProjectsView } from "@/features/projects/components/projects-view";
import { ProjectsSkeleton } from "@/features/projects/components/projects-states";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("projects") };
}

/**
 * Thin route: the catalog is read on this device by a client component, like Jelajahi. The view
 * reads `?kategori=&status=&biaya=` itself, which needs the Suspense boundary.
 */
export default function Page() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsView />
    </Suspense>
  );
}
