import type { Metadata } from "next";
import { GroupsView } from "@/features/community/groups/components/groups-view";

export const metadata: Metadata = {
  title: "Grup Penulis · Kelola · RanahMenulis",
  robots: { index: false },
};

export default function Page() {
  return <GroupsView admin />;
}
