import type { Metadata } from "next";
import { Suspense } from "react";
import { ComposeLoading } from "@/features/community/components/compose/compose-states";
import { ComposeView } from "@/features/community/components/compose/compose-view";

export const metadata: Metadata = {
  title: "Tulis postingan · RanahMenulis",
  robots: { index: false },
};

/**
 * Full-screen like the editor, so it sits outside the (app) frame. The writing surface generates
 * ids at render time, which Next 16 only allows behind a Suspense boundary.
 */
export default function Page() {
  return (
    <Suspense fallback={<ComposeLoading />}>
      <ComposeView draftId={null} />
    </Suspense>
  );
}
