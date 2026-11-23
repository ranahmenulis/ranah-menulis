"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { FilePickButton } from "@/components/ui/file-pick-button";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useSoloRows } from "@/features/projects/solo/hooks/use-solo-rows";
import { addPreviewFile, advanceStage } from "@/features/projects/solo/solo-actions";
import { stagesFor } from "@/features/projects/solo/solo-model";
import { currentStage, neededPreviews, withAdvance } from "@/features/projects/solo/stage-model";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import { soloStore } from "@/features/projects/solo/storage/store";
import type { PreviewFile, SoloProgress, SoloStage } from "@/features/projects/solo/types";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, Registration } from "@/features/projects/types";
import { fileKindLabel, formatFileSize } from "@/lib/files/format-size";
import { problemText } from "@/lib/files/problem-text";
import { saveUpload, type SaveUploadResult } from "@/lib/files/save-upload";
import { fileStore } from "@/lib/files/store";
import { listCardClass } from "../../components/list-card";

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

type SoloCopy = ReturnType<typeof useT>["kelolaOrganizerTabs"]["solo"];

const fileNameOf = (t: SoloCopy, kind: PreviewFile["kind"]) =>
  kind === "cover" ? t.fileCover : t.fileBook;

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
  const tabs = useT().kelolaOrganizerTabs;
  const t = tabs.solo;
  const locale = useLocale();
  const fileName = (kind: PreviewFile["kind"]) => fileNameOf(t, kind);
  const rows = useSoloRows(store);
  const [asking, setAsking] = useState<Ask | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  /** The preview file chosen in the open dialog, already kept on this device. */
  const [picked, setPicked] = useState<Extract<SaveUploadResult, { ok: true }>["file"] | null>(
    null,
  );
  const [pickError, setPickError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  function close() {
    setAsking(null);
    setPicked(null);
    setPickError(null);
  }

  async function pickPreview(file: File) {
    setSaving(true);
    setPickError(null);
    const saved = await saveUpload(file, "preview", fileStore());
    setSaving(false);
    if (saved.ok) setPicked(saved.file);
    else setPickError(problemText(saved.problem, "preview", locale));
  }

  async function confirm(ask: Ask) {
    setBusy(true);
    const { book } = ask;
    const run =
      ask.kind === "lanjut"
        ? advanceStage(store, book)
        : addPreviewFile(store, book, ask.file, picked ?? undefined);
    const result = await run;
    setBusy(false);
    close();
    setSaid(
      result === "ok"
        ? ask.kind === "lanjut"
          ? format(t.advanced, { title: book.title, stage: ask.label.toLowerCase() })
          : format(t.previewAdded, { file: fileName(ask.file), title: book.title })
        : t.failed[result],
    );
    requestAnimationFrame(() => line.current?.focus());
  }

  if (rows.status === "error") {
    return <ErrorBanner action={<RetryButton onClick={rows.reload} />}>{t.loadError}</ErrorBanner>;
  }
  if (rows.status === "loading") {
    return <Skeleton role="status" aria-label={t.loading} className="h-16 w-full" />;
  }

  return (
    <div className="grid gap-4">
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {books.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul aria-label={t.list} className={listCardClass}>
          {books.map((book) => (
            <BookRow key={book.id} book={book} onAsk={setAsking} />
          ))}
        </ul>
      )}
      {asking && (
        <Dialog
          open
          onClose={close}
          title={
            asking.kind === "lanjut"
              ? format(t.advanceTitle, { stage: asking.label.toLowerCase() })
              : format(t.previewTitle, { file: fileName(asking.file) })
          }
          description={asking.kind === "lanjut" ? t.advanceBody : t.previewBody}
          actions={
            <>
              <Button variant="secondary" onClick={close}>
                {tabs.common.cancel}
              </Button>
              <Button
                loading={busy}
                disabled={asking.kind === "pratinjau" && picked === null}
                onClick={() => void confirm(asking)}
              >
                {asking.kind === "lanjut" ? t.advanceConfirm : t.previewConfirm}
              </Button>
            </>
          }
        >
          {asking.kind === "pratinjau" && (
            <div className="mt-4 grid gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <FilePickButton
                  kind="preview"
                  label={format(t.pickLabel, { file: fileName(asking.file) })}
                  onPick={(file) => void pickPreview(file)}
                  disabled={saving}
                >
                  {saving ? t.saving : picked ? t.replace : t.pick}
                </FilePickButton>
                <span className="min-w-0 text-sm wrap-anywhere text-ink-muted">
                  {picked
                    ? `${picked.name} · ${fileKindLabel(picked.type, locale)} · ${formatFileSize(picked.size, locale)}`
                    : t.pickHint}
                </span>
              </div>
              {pickError && (
                <p role="alert" className="text-sm text-danger">
                  {pickError}
                </p>
              )}
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}

function BookRow({ book, onAsk }: { book: Book; onAsk: (ask: Ask) => void }) {
  const t = useT().kelolaOrganizerTabs.solo;
  const stageLabel = useT().projectsSolo.stage.label;
  const fileName = (kind: PreviewFile["kind"]) => fileNameOf(t, kind);
  const current = currentStage(book.stages, book.progress);
  const hasNext = withAdvance(book.stages, book.progress, book, 0) !== null;
  const nextLabel = stageLabel[book.stages[book.stages.indexOf(current) + 1] ?? "selesai"];
  const have = new Set(book.progress?.files.map((f) => f.kind));
  const missing = neededPreviews(book.stages).filter((kind) => !have.has(kind));
  return (
    <li className="grid gap-2 border-b border-line py-3">
      <div className="grid gap-0.5">
        <span className="font-medium wrap-anywhere">{book.title}</span>
        <span className="text-sm text-ink-muted">
          {book.packageName ? format(t.packagePrefix, { name: book.packageName }) : ""}
          {format(t.meta, {
            stage: stageLabel[current].toLowerCase(),
            count: String(book.progress?.files.length ?? 0),
          })}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {hasNext && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAsk({ kind: "lanjut", book, label: nextLabel })}
          >
            {format(t.advanceButton, { stage: nextLabel.toLowerCase() })}
          </Button>
        )}
        {missing.map((file) => (
          <Button
            key={file}
            variant="text"
            size="sm"
            onClick={() => onAsk({ kind: "pratinjau", book, file })}
          >
            {format(t.previewButton, { file: fileName(file) })}
          </Button>
        ))}
      </div>
    </li>
  );
}
