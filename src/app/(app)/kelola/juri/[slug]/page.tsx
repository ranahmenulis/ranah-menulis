import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ContestWorksView } from "@/features/kelola/juri/components/contest-works-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("contestWorks", "manage"), robots: { index: false } };
}

/** Thin route: the works and scores are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/juri/[slug]">) {
  const { slug } = await params;
  return <ContestWorksView slug={slug} />;
}
