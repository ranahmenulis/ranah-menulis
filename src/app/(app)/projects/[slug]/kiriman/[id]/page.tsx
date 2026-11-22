import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { MySkeleton } from "@/features/projects/components/my-states";
import { SubmissionDetail } from "@/features/projects/components/submission-detail";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("submission"), robots: { index: false } };
}

async function DetailRoute({ params }: Pick<PageProps<"/projects/[slug]/kiriman/[id]">, "params">) {
  const { slug, id } = await params;
  return <SubmissionDetail slug={slug} id={id} />;
}

/** Thin route: the submission is read and changed on this device by a client component. */
export default function Page({ params }: PageProps<"/projects/[slug]/kiriman/[id]">) {
  return (
    <Suspense fallback={<MySkeleton label="Memuat kiriman" />}>
      <DetailRoute params={params} />
    </Suspense>
  );
}
