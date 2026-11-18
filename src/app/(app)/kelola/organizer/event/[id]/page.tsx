import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedItemSkeleton } from "@/components/ui/states";
import { ManageEventView } from "@/features/kelola/organizer/events/manage-event-view";

export const metadata: Metadata = { title: "Ubah Event · RanahMenulis" };

async function Detail({ params }: Pick<PageProps<"/kelola/organizer/event/[id]">, "params">) {
  const { id } = await params;
  return <ManageEventView id={id} />;
}

export default function Page({ params }: PageProps<"/kelola/organizer/event/[id]">) {
  return (
    <Suspense fallback={<FeedItemSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
