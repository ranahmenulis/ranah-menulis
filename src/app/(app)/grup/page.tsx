import type { Metadata } from "next";
import { GroupsView } from "@/features/community/groups/components/groups-view";

export const metadata: Metadata = { title: "Grup Penulis · RanahMenulis" };

export default function Page() {
  return <GroupsView />;
}
