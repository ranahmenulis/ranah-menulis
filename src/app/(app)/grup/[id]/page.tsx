import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupLoading, GroupView } from "@/features/community/groups/components/group-view";

export const metadata: Metadata = {
  title: "Grup Penulis · RanahMenulis",
  robots: { index: false },
};

async function GroupPage({ params }: Pick<PageProps<"/grup/[id]">, "params">) {
  const { id } = await params;
  return <GroupView id={id} />;
}

export default function Page({ params }: PageProps<"/grup/[id]">) {
  return (
    <Suspense fallback={<GroupLoading />}>
      <GroupPage params={params} />
    </Suspense>
  );
}
