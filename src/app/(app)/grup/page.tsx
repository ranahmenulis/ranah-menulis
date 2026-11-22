import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { GroupsView } from "@/features/community/groups/components/groups-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("groups") };
}

export default function Page() {
  return <GroupsView />;
}
