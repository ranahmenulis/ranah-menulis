import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmitSkeleton } from "@/features/projects/components/submit-states";
import { SubmitView } from "@/features/projects/components/submit-view";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/kirim">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? `Kirim karya: ${project.title} · Projects · RanahMenulis`
      : "Projects · RanahMenulis",
    robots: { index: false },
  };
}

async function SubmitRoute({
  params,
  searchParams,
}: Pick<PageProps<"/projects/[slug]/kirim">, "params" | "searchParams">) {
  const { slug } = await params;
  const { dokumen } = await searchParams;
  // `?dokumen=<id>` arrives from "Kirim ke proyek" in Studio; anything else starts with none chosen.
  return <SubmitView slug={slug} documentId={typeof dokumen === "string" ? dokumen : null} />;
}

/** Thin route: documents and submissions are read and saved on this device by a client component. */
export default function Page({ params, searchParams }: PageProps<"/projects/[slug]/kirim">) {
  return (
    <Suspense fallback={<SubmitSkeleton />}>
      <SubmitRoute params={params} searchParams={searchParams} />
    </Suspense>
  );
}
