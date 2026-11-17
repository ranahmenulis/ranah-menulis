import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentView } from "@/features/projects/components/payment-view";
import { RegisterSkeleton } from "@/features/projects/components/register-states";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/bayar">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  return {
    title: project
      ? `Bayar: ${project.title} · Projects · RanahMenulis`
      : "Proyek tidak ditemukan · RanahMenulis",
    robots: { index: false },
  };
}

async function PayRoute({ params }: Pick<PageProps<"/projects/[slug]/bayar">, "params">) {
  const { slug } = await params;
  return <PaymentView slug={slug} />;
}

/** Thin route: the registration and its payment are read on this device by a client component. */
export default function Page({ params }: PageProps<"/projects/[slug]/bayar">) {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <PayRoute params={params} />
    </Suspense>
  );
}
