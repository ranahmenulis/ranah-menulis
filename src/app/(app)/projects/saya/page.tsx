import type { Metadata } from "next";
import { Suspense } from "react";
import { MyProjectsView } from "@/features/projects/components/my-projects-view";
import { MySkeleton } from "@/features/projects/components/my-states";

export const metadata: Metadata = { title: "Proyek saya · RanahMenulis", robots: { index: false } };

/** Thin route: registrations and submissions are read on this device by a client component. */
export default function Page() {
  return (
    <Suspense fallback={<MySkeleton label="Memuat Proyek saya" />}>
      <MyProjectsView />
    </Suspense>
  );
}
