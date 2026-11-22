import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { MySkeleton } from "@/features/projects/components/my-states";
import { ReviseView } from "@/features/projects/components/revise-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("sendRevision"), robots: { index: false } };
}

async function ReviseRoute({
  params,
}: Pick<PageProps<"/projects/[slug]/kiriman/[id]/revisi">, "params">) {
  const { slug, id } = await params;
  return <ReviseView slug={slug} id={id} />;
}

/** Thin route: documents and submissions are read and saved on this device by a client component. */
export default function Page({ params }: PageProps<"/projects/[slug]/kiriman/[id]/revisi">) {
  return (
    <Suspense fallback={<MySkeleton label="Memuat halaman revisi" />}>
      <ReviseRoute params={params} />
    </Suspense>
  );
}
