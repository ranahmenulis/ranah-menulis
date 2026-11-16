import type { Metadata } from "next";
import { Suspense } from "react";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { ProjectDetailSkeleton } from "@/features/projects/components/projects-states";

/** The tab names the project; a draft or unknown address is "not found" like on the page. */
export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? `${project.title} · Projects · RanahMenulis`
      : "Proyek tidak ditemukan · RanahMenulis",
  };
}

async function ProjectRoute({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} />;
}

/** Thin route: the project is read on this device by a client component, like the post page. */
export default function Page({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectRoute params={params} />
    </Suspense>
  );
}
