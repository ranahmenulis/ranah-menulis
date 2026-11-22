import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { FeedItemSkeleton } from "@/components/ui/states";
import { EventView } from "@/features/community/events/components/event-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("eventDetail") };
}

async function Detail({ params }: Pick<PageProps<"/event/[id]">, "params">) {
  const { id } = await params;
  return <EventView id={id} />;
}

export default function Page({ params }: PageProps<"/event/[id]">) {
  return (
    <Suspense fallback={<FeedItemSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
