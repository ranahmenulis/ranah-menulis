import type { Metadata } from "next";
import { Suspense } from "react";
import { ComposeLoading } from "@/features/community/components/compose/compose-states";
import { ComposeView } from "@/features/community/components/compose/compose-view";

export const metadata: Metadata = {
  title: "Draf postingan · RanahMenulis",
  robots: { index: false },
};

async function DraftRoute({ params }: Pick<PageProps<"/tulis/[id]">, "params">) {
  const { id } = await params;
  return <ComposeView draftId={id} />;
}

export default function Page({ params }: PageProps<"/tulis/[id]">) {
  return (
    <Suspense fallback={<ComposeLoading />}>
      <DraftRoute params={params} />
    </Suspense>
  );
}
