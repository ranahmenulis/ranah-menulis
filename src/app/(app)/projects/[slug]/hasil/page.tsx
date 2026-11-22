import type { Metadata } from "next";
import { Suspense } from "react";
import { pageTitle, titleWith } from "@/lib/i18n/metadata";
import { MySkeleton } from "@/features/projects/components/my-states";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { ResultsView } from "@/features/projects/lomba/components/results-view";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/hasil">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? await titleWith(project.title, ["projects"], "results")
      : await pageTitle("projects"),
  };
}

async function ResultsRoute({ params }: Pick<PageProps<"/projects/[slug]/hasil">, "params">) {
  const { slug } = await params;
  return <ResultsView slug={slug} />;
}

/** Thin route: the results are public; the stage and the reader's own work are read on this device. */
export default function Page({ params }: PageProps<"/projects/[slug]/hasil">) {
  return (
    <Suspense fallback={<MySkeleton label="Memuat hasil lomba" />}>
      <ResultsRoute params={params} />
    </Suspense>
  );
}
