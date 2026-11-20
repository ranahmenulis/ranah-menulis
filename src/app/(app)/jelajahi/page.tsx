import type { Metadata } from "next";
import { DiscoverView } from "@/features/community/components/discover/discover-view";

export const metadata: Metadata = { title: "Community · RanahMenulis" };

export default function Page() {
  return <DiscoverView />;
}
