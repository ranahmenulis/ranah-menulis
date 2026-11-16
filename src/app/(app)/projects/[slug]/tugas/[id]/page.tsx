import type { Metadata } from "next";
import { Suspense } from "react";
import { MySkeleton } from "@/features/projects/components/my-states";
import { AssignmentView } from "@/features/projects/kelas/components/assignment-view";

export const metadata: Metadata = { title: "Tugas kelas · RanahMenulis", robots: { index: false } };

async function AssignmentRoute({
  params,
}: Pick<PageProps<"/projects/[slug]/tugas/[id]">, "params">) {
  const { slug, id } = await params;
  return <AssignmentView slug={slug} id={id} />;
}

/** Thin route: the class, the documents and the hand-in are read and saved on this device. */
export default function Page({ params }: PageProps<"/projects/[slug]/tugas/[id]">) {
  return (
    <Suspense fallback={<MySkeleton label="Memuat tugas" />}>
      <AssignmentRoute params={params} />
    </Suspense>
  );
}
