import type { Metadata } from "next";
import { Suspense } from "react";
import { pageTitle, titleWith } from "@/lib/i18n/metadata";
import { RegisterSkeleton } from "@/features/projects/components/register-states";
import { RegisterView } from "@/features/projects/components/register-view";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/daftar">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? await titleWith(project.title, ["projects"], "register")
      : await pageTitle("projects"),
    robots: { index: false },
  };
}

async function RegisterRoute({ params }: Pick<PageProps<"/projects/[slug]/daftar">, "params">) {
  const { slug } = await params;
  return <RegisterView slug={slug} />;
}

/** Thin route: registration is read and saved on this device by a client component. */
export default function Page({ params }: PageProps<"/projects/[slug]/daftar">) {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterRoute params={params} />
    </Suspense>
  );
}
