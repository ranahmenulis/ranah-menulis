import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorLoading } from "@/features/studio/components/editor-states";
import { StudioEditor } from "@/features/studio/components/studio-editor";

export const metadata: Metadata = {
  title: "Editor · RanahMenulis",
  robots: { index: false },
};

async function EditorRoute({ params }: Pick<PageProps<"/studio/[id]">, "params">) {
  const { id } = await params;
  return <StudioEditor documentId={id} />;
}

/** Thin route: the editor itself is a client component that reads documents from this device. */
export default function Page({ params }: PageProps<"/studio/[id]">) {
  return (
    <Suspense
      fallback={
        <main className="px-4 pt-24">
          <EditorLoading />
        </main>
      }
    >
      <EditorRoute params={params} />
    </Suspense>
  );
}
