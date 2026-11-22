import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { GroupLoading, GroupView } from "@/features/community/groups/components/group-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("groups"), robots: { index: false } };
}

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
