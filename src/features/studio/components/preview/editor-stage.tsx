import { useEffect, useRef, type ReactNode } from "react";
import type { DocumentLayout } from "../../document-layout";
import { PagePreview } from "./page-preview";

type Props = {
  className: string;
  /** True while the Page Preview is open; the editor stays mounted behind it, hidden. */
  showPreview: boolean;
  preview: { title: string; html: string; layout: DocumentLayout };
  children: ReactNode;
};

/** The scrolling area of the editor screen: the writing surface, or the page preview over it. */
export function EditorStage({ className, showPreview, preview, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  // The preview opens at the first page, not wherever the writer had scrolled to.
  useEffect(() => {
    if (showPreview) ref.current?.scrollTo({ top: 0 });
  }, [showPreview]);
  return (
    <main ref={ref} aria-label="Kanvas menulis" className={className}>
      {showPreview && <PagePreview {...preview} />}
      <div hidden={showPreview}>{children}</div>
    </main>
  );
}
