import type { Metadata } from "next";
import { ContestWorksView } from "@/features/kelola/juri/components/contest-works-view";

export const metadata: Metadata = {
  title: "Karya lomba · Kelola · RanahMenulis",
  robots: { index: false },
};

/** Thin route: the works and scores are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/juri/[slug]">) {
  const { slug } = await params;
  return <ContestWorksView slug={slug} />;
}
