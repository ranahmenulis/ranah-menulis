import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedItemSkeleton } from "@/components/ui/states";
import { EventView } from "@/features/community/events/components/event-view";

export const metadata: Metadata = { title: "Detail Event · RanahMenulis" };

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
