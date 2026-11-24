"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { FilePickButton } from "@/components/ui/file-pick-button";
import { useT } from "@/lib/i18n/provider";
import { validateBook } from "../../book";
import { useBookCover } from "../../hooks/use-book-cover";
import type { FolderCover } from "../../storage/document-store";
import { FolderCover as CoverView } from "../book/folder-cover";

const FORM_ID = "work-cover-form";

/**
 * Pick, replace or remove a work's cover. A cover needs a short description (it is a picture of
 * the work); an image picked here and not saved is freed on cancel, the old one after a save.
 */
export function CoverDialog({
  title,
  saved,
  onSave,
  onClose,
}: {
  title: string;
  saved: FolderCover | null;
  onSave: (cover: FolderCover | null) => Promise<void>;
  onClose: () => void;
}) {
  const t = useT().studioBook.dialog;
  const w = useT().studioWork.cover;
  const c = useBookCover(saved);
  const { cover, error, busy } = c;

  async function cancel() {
    await c.discardPicked();
    onClose();
  }

  async function submit() {
    // The title is the work's own; only the cover rules apply here.
    const problem = validateBook(title || "-", cover);
    if (problem) return c.setError(t.errors[problem]);
    c.setBusy(true);
    try {
      await onSave(cover && { fileId: cover.fileId, alt: cover.alt.trim() });
      await c.discardReplaced();
      onClose();
    } catch {
      c.setBusy(false);
      c.setError(t.saveFailed);
    }
  }

  const preview = { id: "cover", name: title, createdAt: 0, kind: "book" as const };
  return (
    <Dialog
      open
      onClose={() => void cancel()}
      title={w.title}
      actions={
        <>
          <Button variant="secondary" onClick={() => void cancel()}>
            {t.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={busy}>
            {w.save}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        noValidate
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex items-start gap-4">
          <CoverView folder={{ ...preview, cover: cover ?? undefined }} width={88} />
          <div className="grid min-w-0 flex-1 gap-2">
            <div className="flex flex-wrap gap-2">
              <FilePickButton
                kind="image"
                label={cover ? t.coverReplace : t.coverAdd}
                onPick={c.pick}
                disabled={busy}
              >
                {!cover && <ImageSquare size={18} aria-hidden />}
                {busy ? t.coverBusy : cover ? t.coverReplace : t.coverAdd}
              </FilePickButton>
              {cover && (
                <Button variant="text" size="sm" onClick={() => void c.remove()}>
                  {t.coverRemove}
                </Button>
              )}
            </div>
            <p className="text-xs text-ink-muted">{t.coverHint}</p>
          </div>
        </div>
        {cover && (
          <Field id="work-cover-alt" label={t.altLabel} hint={t.altHint}>
            <Input
              id="work-cover-alt"
              value={cover.alt}
              autoFocus
              onChange={(e) => c.setAlt(e.target.value)}
            />
          </Field>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
