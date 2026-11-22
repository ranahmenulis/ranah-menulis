"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice, RadioChoice } from "@/components/ui/choice";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { format as formatText, useT } from "@/lib/i18n/provider";
import { DEFAULT_LAYOUT, type DocumentLayout } from "../document-layout";
import { downloadBlob, exportFileName } from "../export/download";
import { toPlainText } from "../export/export-blocks";
import { DEFAULT_PDF_OPTIONS, type PdfOptions } from "../export/export-pdf";

type Format = "txt" | "pdf";

type ExportDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Page layout of the document; the PDF follows it. */
  layout?: DocumentLayout;
  /** The text as it is in the editor now, or null when the editor is not open. */
  getContent: () => JSONContent | null;
};

/**
 * "Ekspor" from the editor (STD-07, N3): TXT or PDF, made on this device and downloaded. TXT has no
 * options; PDF can put the title on its own first page and number the pages. Margin, font and
 * line spacing come from the layout of the document.
 */
export function ExportDialog({
  open,
  onClose,
  title,
  layout = DEFAULT_LAYOUT,
  getContent,
}: ExportDialogProps) {
  const all = useT();
  const note = all.studioLayout.export;
  const t = all.studioEditor.export;
  const toast = useToast();
  const [format, setFormat] = useState<Format>("pdf");
  const [pdf, setPdf] = useState<PdfOptions>(DEFAULT_PDF_OPTIONS);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  function close() {
    if (busy) return;
    setFailed(false);
    onClose();
  }

  async function run() {
    const content = getContent();
    if (!content) return setFailed(true);
    setBusy(true);
    setFailed(false);
    try {
      if (format === "txt") {
        const text = toPlainText(title, content);
        downloadBlob(
          new Blob([text], { type: "text/plain;charset=utf-8" }),
          exportFileName(title, "txt"),
        );
      } else {
        // jsPDF is loaded only now, so the editor does not carry it.
        const { buildPdf } = await import("../export/export-pdf");
        downloadBlob(await buildPdf(title, content, pdf, layout), exportFileName(title, "pdf"));
      }
      setBusy(false);
      onClose();
      toast({ message: formatText(t.done, { format: format.toUpperCase() }) });
    } catch {
      setBusy(false);
      setFailed(true);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      dismissible={!busy}
      swipeToDismiss
      title={t.title}
      description={t.description}
      actions={
        <>
          <Button variant="text" onClick={close} disabled={busy}>
            {t.cancel}
          </Button>
          <Button onClick={() => void run()} loading={busy}>
            {formatText(t.download, { format: format.toUpperCase() })}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {failed && <ErrorBanner>{t.failed}</ErrorBanner>}
        <div role="radiogroup" aria-label={t.format} className="grid gap-3">
          <RadioChoice
            name="export-format"
            label="PDF"
            hint={t.pdfHint}
            checked={format === "pdf"}
            onChange={() => setFormat("pdf")}
          />
          <RadioChoice
            name="export-format"
            label="TXT"
            hint={t.txtHint}
            checked={format === "txt"}
            onChange={() => setFormat("txt")}
          />
        </div>
        {format === "pdf" && (
          <div className="grid gap-4 border-t border-line pt-4">
            <CheckChoice
              label={t.titlePage}
              hint={t.titlePageHint}
              checked={pdf.titlePage}
              onChange={(e) => setPdf({ ...pdf, titlePage: e.target.checked })}
            />
            <CheckChoice
              label={t.pageNumbers}
              checked={pdf.pageNumbers}
              onChange={(e) => setPdf({ ...pdf, pageNumbers: e.target.checked })}
            />
            {layout.font !== "times" && (
              <p className="text-xs text-ink-muted">{note.fontNote[layout.font]}</p>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
