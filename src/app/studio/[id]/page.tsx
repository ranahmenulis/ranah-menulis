import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorLoading } from "@/features/studio/components/editor-states";
import { StudioEditor } from "@/features/studio/components/studio-editor";

export const metadata: Metadata = {
  title: "Editor · RanahMenulis",
  robots: { index: false },
};

async function EditorRoute({ params, searchParams }: PageProps<"/studio/[id]">) {
  const [{ id }, { event }] = await Promise.all([params, searchParams]);
  return <StudioEditor documentId={id} eventId={typeof event === "string" ? event : undefined} />;
}

/** Thin route: the editor itself is a client component that reads documents from this device. */
export default function Page(props: PageProps<"/studio/[id]">) {
  return (
    <Suspense
      fallback={
        <main className="px-4 pt-24">
          <EditorLoading />
        </main>
      }
    >
      <EditorRoute {...props} />
    </Suspense>
  );
}
