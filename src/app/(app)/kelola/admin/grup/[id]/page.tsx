import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupLoading, GroupView } from "@/features/community/groups/components/group-view";

export const metadata: Metadata = {
  title: "Grup Penulis · Kelola · RanahMenulis",
  robots: { index: false },
};

async function GroupPage({ params }: Pick<PageProps<"/kelola/admin/grup/[id]">, "params">) {
  const { id } = await params;
  return <GroupView id={id} admin />;
}

export default function Page({ params }: PageProps<"/kelola/admin/grup/[id]">) {
  return (
    <Suspense fallback={<GroupLoading />}>
      <GroupPage params={params} />
    </Suspense>
  );
}
