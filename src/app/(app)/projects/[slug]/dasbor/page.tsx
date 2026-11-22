import type { Metadata } from "next";
import { Suspense } from "react";
import { pageTitle, titleWith } from "@/lib/i18n/metadata";
import { MySkeleton } from "@/features/projects/components/my-states";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { DashboardSwitch } from "@/features/projects/components/dashboard-switch";

const dashboardKey = (category: string) =>
  category === "solo" ? "dashboardSolo" : category === "kelas" ? "dashboardClass" : "dashboard";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/dasbor">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? await titleWith(project.title, ["projects"], dashboardKey(project.category))
      : await pageTitle("projects"),
    robots: { index: false },
  };
}

async function DashboardRoute({ params }: Pick<PageProps<"/projects/[slug]/dasbor">, "params">) {
  const { slug } = await params;
  return <DashboardSwitch slug={slug} />;
}

/** Thin route: registrations, assignments and progress are read on this device by a client component. */
export default function Page({ params }: PageProps<"/projects/[slug]/dasbor">) {
  return (
    <Suspense fallback={<MySkeleton label="Memuat dasbor" />}>
      <DashboardRoute params={params} />
    </Suspense>
  );
}
