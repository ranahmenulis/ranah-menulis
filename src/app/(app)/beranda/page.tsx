import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { HomeView } from "@/features/home/home-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("home") };
}

export default function Page() {
  return <HomeView />;
}
