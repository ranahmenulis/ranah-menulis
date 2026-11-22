import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { MentorReviewView } from "@/features/kelola/mentor/components/mentor-review-view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("gradeTask", "manage"), robots: { index: false } };
}

export default async function Page({
  params,
}: PageProps<"/kelola/mentor/[slug]/pengumpulan/[id]">) {
  const { slug, id } = await params;
  return <MentorReviewView slug={slug} id={id} />;
}
