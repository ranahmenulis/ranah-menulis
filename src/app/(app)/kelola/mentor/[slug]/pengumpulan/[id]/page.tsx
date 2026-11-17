import type { Metadata } from "next";
import { MentorReviewView } from "@/features/kelola/mentor/components/mentor-review-view";

export const metadata: Metadata = {
  title: "Nilai tugas · Kelola · RanahMenulis",
  robots: { index: false },
};

export default async function Page({
  params,
}: PageProps<"/kelola/mentor/[slug]/pengumpulan/[id]">) {
  const { slug, id } = await params;
  return <MentorReviewView slug={slug} id={id} />;
}
