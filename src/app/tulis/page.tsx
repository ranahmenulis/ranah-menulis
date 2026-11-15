import type { Metadata } from "next";
import { Suspense } from "react";
import { ComposeLoading } from "@/features/community/components/compose/compose-states";
import { ComposeView } from "@/features/community/components/compose/compose-view";

export const metadata: Metadata = {
  title: "Tulis postingan · RanahMenulis",
  robots: { index: false },
};

async function ComposeRoute({ searchParams }: Pick<PageProps<"/tulis">, "searchParams">) {
  const { dokumen } = await searchParams;
  // `?dokumen=<id>` arrives from "Bagikan" in the editor; anything else starts a blank post.
  return <ComposeView draftId={null} sourceDocId={typeof dokumen === "string" ? dokumen : null} />;
}

/**
 * Full-screen like the editor, so it sits outside the (app) frame. The writing surface generates
 * ids at render time, and the address is read per request; both need to sit behind Suspense.
 */
export default function Page({ searchParams }: PageProps<"/tulis">) {
  return (
    <Suspense fallback={<ComposeLoading />}>
      <ComposeRoute searchParams={searchParams} />
    </Suspense>
  );
}
