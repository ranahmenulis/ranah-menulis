import type { Metadata } from "next";
import { Suspense } from "react";
import { pageTitle } from "@/lib/i18n/metadata";
import { WorkPage } from "@/features/studio/components/work/work-page";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("studio"), robots: { index: false } };
}

async function SummaryRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkPage key={id} id={id} tab="ringkasan" />;
}

/** Thin route: the work's page is a client component that reads this device's documents. */
export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="px-4 pt-24" />}>
      <SummaryRoute {...props} />
    </Suspense>
  );
}
