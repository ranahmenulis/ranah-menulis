import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { ReviewView } from "@/features/kelola/editor/components/review-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("reviewWork", "manage"), robots: { index: false } };
}

/** Thin route: submissions are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/editor/[id]">) {
  const { id } = await params;
  return <ReviewView id={id} />;
}
