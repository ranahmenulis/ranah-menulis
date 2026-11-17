"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useSoloRows } from "@/features/projects/solo/hooks/use-solo-rows";
import {
  addPreviewFile,
  advanceStage,
  type ActionResult,
} from "@/features/projects/solo/solo-actions";
import { stagesFor } from "@/features/projects/solo/solo-model";
import {
  STAGE_LABEL,
  currentStage,
  neededPreviews,
  withAdvance,
} from "@/features/projects/solo/stage-model";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import { soloStore } from "@/features/projects/solo/storage/store";
import type { PreviewFile, SoloProgress, SoloStage } from "@/features/projects/solo/types";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, Registration } from "@/features/projects/types";

type Book = {
  id: string;
  slug: string;
  title: string;
  packageName?: string;
  stages: SoloStage[];
  progress: SoloProgress | null;
};

type Ask =
  | { kind: "lanjut"; book: Book; label: string }
  | { kind: "pratinjau"; book: Book; file: PreviewFile["kind"] };

const fileName = (kind: PreviewFile["kind"]) => (kind === "cover" ? "sampul" : "isi buku");

const failed: Record<Exclude<ActionResult, "ok">, string> = {
  rejected: "Tahap buku ini sudah berubah, jadi tidak ada yang dilakukan.",
  missing: "Buku ini tidak ditemukan lagi.",
  failed: "Data di perangkat ini tidak terbaca, jadi belum tersimpan.",
};

/**
 * The accepted Solo books of the project and where each one stands (SOL-02). The publishing team
 * moves a book one stage on and adds the previews the package promises; the rules are the ones in
 * `stage-model`, so nothing here can do what the rules refuse. Only books sent from this device
 * are listed.
 */
export function SoloStageList({
  project,
  works,
  registration,
  store = soloStore,
}: {
  project: Project;
  works: Submission[];
  registration: Registration | undefined;
  store?: SoloStore;
}) {
  const rows = useSoloRows(store);
  const [asking, setAsking] = useState<Ask | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);

  const books: Book[] = works
    .filter((w) => w.status === "diterima")
    .map((w) => {
      const packageName = w.packageName ?? registration?.packageName;
      return {
        id: w.id,
        slug: w.slug,
        title: w.title,
        packageName,
        stages: stagesFor(project, packageName),
        progress: rows.rows.find((r) => r.id === w.id) ?? null,
      };
    });

  async function confirm(ask: Ask) {
    setBusy(true);
    const { book } = ask;
    const run =
      ask.kind === "lanjut" ? advanceStage(store, book) : addPreviewFile(store, book, ask.file);
    const result = await run;
    setBusy(false);
    setAsking(null);
    setSaid(
      result === "ok"
        ? ask.kind === "lanjut"
          ? `“${book.title}” sekarang di tahap ${ask.label.toLowerCase()}.`
          : `Pratinjau ${fileName(ask.file)} ditambahkan ke “${book.title}”.`
        : failed[result],
    );
    requestAnimationFrame(() => line.current?.focus());
  }

  if (rows.status === "error") {
    return (
      <ErrorBanner action={<RetryButton onClick={rows.reload} />}>
        Tahap buku belum bisa dibuka karena data di perangkat ini tidak terbaca.
      </ErrorBanner>
    );
  }
  if (rows.status === "loading") {
    return <Skeleton role="status" aria-label="Memuat tahap buku" className="h-16 w-full" />;
  }

  return (
    <div className="grid gap-4">
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {books.length === 0 ? (
        <EmptyState>
          Belum ada naskah yang diterima di perangkat ini. Tahap berjalan setelah editor menerima
          naskah (tab Kiriman).
        </EmptyState>
      ) : (
        <ul aria-label="Buku dalam penerbitan" className="border-t border-line">
          {books.map((book) => (
            <BookRow key={book.id} book={book} onAsk={setAsking} />
          ))}
        </ul>
      )}
      {asking && (
        <Dialog
          open
          onClose={() => setAsking(null)}
          title={
            asking.kind === "lanjut"
              ? `Lanjut ke ${asking.label.toLowerCase()}?`
              : `Tambah pratinjau ${fileName(asking.file)}?`
          }
          description={
            asking.kind === "lanjut"
              ? "Penulis melihat tahap barunya di dasbor."
              : "Penulis bisa melihat pratinjau ini sebelum memberi persetujuan final."
          }
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                Batal
              </Button>
              <Button loading={busy} onClick={() => void confirm(asking)}>
                {asking.kind === "lanjut" ? "Lanjutkan" : "Tambahkan"}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

function BookRow({ book, onAsk }: { book: Book; onAsk: (ask: Ask) => void }) {
  const current = currentStage(book.stages, book.progress);
  const hasNext = withAdvance(book.stages, book.progress, book, 0) !== null;
  const nextLabel = STAGE_LABEL[book.stages[book.stages.indexOf(current) + 1] ?? "selesai"];
  const have = new Set(book.progress?.files.map((f) => f.kind));
  const missing = neededPreviews(book.stages).filter((kind) => !have.has(kind));
  return (
    <li className="grid gap-2 border-b border-line py-3">
      <div className="grid gap-0.5">
        <span className="font-medium wrap-anywhere">{book.title}</span>
        <span className="text-sm text-ink-muted">
          {book.packageName ? `Paket ${book.packageName} · ` : ""}tahap{" "}
          {STAGE_LABEL[current].toLowerCase()}
          {` · ${book.progress?.files.length ?? 0} pratinjau`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {hasNext && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAsk({ kind: "lanjut", book, label: nextLabel })}
          >
            Lanjut ke {nextLabel.toLowerCase()}
          </Button>
        )}
        {missing.map((file) => (
          <Button
            key={file}
            variant="text"
            size="sm"
            onClick={() => onAsk({ kind: "pratinjau", book, file })}
          >
            Tambah pratinjau {fileName(file)}
          </Button>
        ))}
      </div>
    </li>
  );
}
