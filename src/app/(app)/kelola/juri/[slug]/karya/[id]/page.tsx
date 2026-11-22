import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ScoreView } from "@/features/kelola/juri/components/score-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("scoreWork", "manage"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/kelola/juri/[slug]/karya/[id]">) {
  const { slug, id } = await params;
  return <ScoreView slug={slug} id={id} />;
}
