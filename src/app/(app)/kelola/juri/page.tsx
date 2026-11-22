import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ContestsView } from "@/features/kelola/juri/components/contests-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("judging", "manage") };
}

export default function Page() {
  return <ContestsView />;
}
