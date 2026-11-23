import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { EditorLoading } from "@/features/studio/components/editor-states";
import { StudioEditor } from "@/features/studio/components/studio-editor";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("editor"), robots: { index: false } };
}

async function EditorRoute({ params, searchParams }: PageProps<"/studio/[id]">) {
  const [{ id }, { event, folder }] = await Promise.all([params, searchParams]);
  return (
    <StudioEditor
      key={id}
      documentId={id}
      eventId={typeof event === "string" ? event : undefined}
      folderId={typeof folder === "string" ? folder : undefined}
    />
  );
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
