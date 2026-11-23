import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { ComposeLoading } from "@/features/community/components/compose/compose-states";
import { ComposeView } from "@/features/community/components/compose/compose-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("writePost"), robots: { index: false } };
}

async function ComposeRoute({ searchParams }: Pick<PageProps<"/tulis">, "searchParams">) {
  const { dokumen } = await searchParams;
  // `?dokumen=<id>` can name a Studio document to start from (the editor no longer links here, client 23 November 2026); anything else starts a blank post.
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
