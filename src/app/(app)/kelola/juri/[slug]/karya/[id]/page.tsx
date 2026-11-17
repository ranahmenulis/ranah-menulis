import type { Metadata } from "next";
import { ScoreView } from "@/features/kelola/juri/components/score-view";

export const metadata: Metadata = {
  title: "Nilai karya · Kelola · RanahMenulis",
  robots: { index: false },
};

export default async function Page({ params }: PageProps<"/kelola/juri/[slug]/karya/[id]">) {
  const { slug, id } = await params;
  return <ScoreView slug={slug} id={id} />;
}
