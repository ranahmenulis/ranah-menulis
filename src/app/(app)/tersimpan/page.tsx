import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { SavedView } from "@/features/saved/saved-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("saved") };
}

export default function Page() {
  return <SavedView />;
}
