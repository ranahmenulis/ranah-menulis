import type { Metadata } from "next";
import { ReviewView } from "@/features/kelola/editor/components/review-view";

export const metadata: Metadata = {
  title: "Tinjau karya · Kelola · RanahMenulis",
  robots: { index: false },
};

/** Thin route: submissions are read on this device by a client component. */
export default async function Page({ params }: PageProps<"/kelola/editor/[id]">) {
  const { id } = await params;
  return <ReviewView id={id} />;
}
