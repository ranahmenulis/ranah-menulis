import type { Metadata } from "next";
import { Suspense } from "react";
import { MySkeleton } from "@/features/projects/components/my-states";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { SoloDashboard } from "@/features/projects/solo/components/solo-dashboard";
import { ClassDashboard } from "@/features/projects/kelas/components/class-dashboard";

const dashboardName = (category: string) =>
  category === "solo" ? "Dasbor penerbitan" : category === "kelas" ? "Dasbor kelas" : "Dasbor";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/dasbor">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? `${dashboardName(project.category)}: ${project.title} · Projects · RanahMenulis`
      : "Proyek tidak ditemukan · RanahMenulis",
    robots: { index: false },
  };
}

async function DashboardRoute({ params }: Pick<PageProps<"/projects/[slug]/dasbor">, "params">) {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return project?.category === "solo" ? (
    <SoloDashboard slug={slug} />
  ) : (
    <ClassDashboard slug={slug} />
  );
}

/** Thin route: registrations, assignments and progress are read on this device by a client component. */
export default function Page({ params }: PageProps<"/projects/[slug]/dasbor">) {
  return (
    <Suspense fallback={<MySkeleton label="Memuat dasbor" />}>
      <DashboardRoute params={params} />
    </Suspense>
  );
}
