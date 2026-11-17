"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice, RadioChoice } from "@/components/ui/choice";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { downloadBlob, exportFileName } from "../export/download";
import { toPlainText } from "../export/export-blocks";
import { DEFAULT_PDF_OPTIONS, type PdfOptions } from "../export/export-pdf";

type Format = "txt" | "pdf";

type ExportDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** The text as it is in the editor now, or null when the editor is not open. */
  getContent: () => JSONContent | null;
};

/**
 * "Ekspor" from the editor (STD-07, N3): TXT or PDF, made on this device and downloaded. TXT has no
 * options; PDF can put the title on its own first page, number the pages and set the line spacing.
 */
export function ExportDialog({ open, onClose, title, getContent }: ExportDialogProps) {
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
        downloadBlob(await buildPdf(title, content, pdf), exportFileName(title, "pdf"));
      }
      setBusy(false);
      onClose();
      toast({ message: `Berkas ${format.toUpperCase()} diunduh.` });
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
      title="Ekspor dokumen"
      description="Berkas dibuat di perangkat ini lalu diunduh. Hanya teks yang diekspor; tebal dan miring tidak ikut."
      actions={
        <>
          <Button variant="text" onClick={close} disabled={busy}>
            Batal
          </Button>
          <Button onClick={() => void run()} loading={busy}>
            Unduh {format.toUpperCase()}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {failed && (
          <ErrorBanner>
            Berkas belum bisa dibuat. Isi dokumenmu tidak berubah. Coba lagi.
          </ErrorBanner>
        )}
        <div role="radiogroup" aria-label="Format" className="grid gap-3">
          <RadioChoice
            name="export-format"
            label="PDF"
            hint="Untuk dibaca atau dicetak"
            checked={format === "pdf"}
            onChange={() => setFormat("pdf")}
          />
          <RadioChoice
            name="export-format"
            label="TXT"
            hint="Teks biasa, bisa dibuka di aplikasi apa pun"
            checked={format === "txt"}
            onChange={() => setFormat("txt")}
          />
        </div>
        {format === "pdf" && (
          <div className="grid gap-4 border-t border-line pt-4">
            <CheckChoice
              label="Judul di halaman depan"
              hint="Judul sendirian di halaman pertama, tulisan mulai di halaman kedua"
              checked={pdf.titlePage}
              onChange={(e) => setPdf({ ...pdf, titlePage: e.target.checked })}
            />
            <CheckChoice
              label="Nomor halaman"
              checked={pdf.pageNumbers}
              onChange={(e) => setPdf({ ...pdf, pageNumbers: e.target.checked })}
            />
            <Field id="export-spacing" label="Jarak baris">
              <Select
                id="export-spacing"
                value={String(pdf.lineSpacing)}
                onChange={(e) =>
                  setPdf({
                    ...pdf,
                    lineSpacing: Number(e.target.value) as PdfOptions["lineSpacing"],
                  })
                }
              >
                <option value="1.15">Rapat (1,15)</option>
                <option value="1.5">Sedang (1,5)</option>
                <option value="2">Lebar (2)</option>
              </Select>
            </Field>
          </div>
        )}
      </div>
    </Dialog>
  );
}
