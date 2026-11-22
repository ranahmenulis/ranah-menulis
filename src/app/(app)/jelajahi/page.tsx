import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { DiscoverView } from "@/features/community/components/discover/discover-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("community") };
}

export default function Page() {
  return <DiscoverView />;
}
