"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FilePickButton } from "@/components/ui/file-pick-button";
import { useT } from "@/lib/i18n/provider";
import { useBookCover } from "../../hooks/use-book-cover";
import { coverOf, validateBook } from "../../book";
import { parseKind, type DocumentKind } from "../../document-classification";
import { SYNOPSIS_LIMIT } from "../work/synopsis-field";
import type { FolderCover, FolderPatch, StudioFolder } from "../../storage/document-store";
import { FolderCover as CoverView } from "./folder-cover";

const FORM_ID = "book-form";

/**
 * What the dialog hands back: the title and the cover (null = none). A new book also brings its
 * type and synopsis (client Wafiy, 28 November 2026); settings leave those to the book page.
 */
export type BookValues = {
  name: string;
  cover: FolderCover | null;
  genre?: DocumentKind;
  synopsis?: string;
};

type Props = {
  /** The folder being set up as a book; null creates a new book. */
  folder: StudioFolder | null;
  onSubmit: (values: BookValues) => Promise<void>;
  onClose: () => void;
};

/** The change a saved dialog makes to an existing folder. */
export function bookPatch(values: BookValues): FolderPatch {
  return { name: values.name, kind: "book", cover: values.cover };
}

/** A new book's type and synopsis: both optional, both editable later on the book page. */
function IntroFields({
  show,
  genre,
  synopsis,
  onGenre,
  onSynopsis,
}: {
  /** Only a new book asks; book settings leave these to the book page. */
  show: boolean;
  genre: DocumentKind | undefined;
  synopsis: string;
  onGenre: (genre: DocumentKind | undefined) => void;
  onSynopsis: (synopsis: string) => void;
}) {
  const t = useT().studioBook.dialog;
  const docs = useT().studioDocuments;
  if (!show) return null;
  return (
    <>
      <Field id="book-genre" label={t.genreLabel} optional>
        <Select
          id="book-genre"
          value={genre ?? ""}
          onChange={(e) => onGenre(parseKind(e.target.value) ?? undefined)}
        >
          <option value="">{docs.classification.noKind}</option>
          {Object.entries(docs.kinds).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="book-synopsis" label={t.synopsisLabel} hint={t.synopsisHint} optional>
        <Textarea
          id="book-synopsis"
          rows={3}
          maxLength={SYNOPSIS_LIMIT}
          value={synopsis}
          onChange={(e) => onSynopsis(e.target.value)}
        />
      </Field>
    </>
  );
}

/** The type and synopsis a new book hands back; nothing when absent or when editing. */
function introValues(creating: boolean, genre: DocumentKind | undefined, synopsis: string) {
  if (!creating) return {};
  const text = synopsis.trim();
  return { ...(genre ? { genre } : {}), ...(text ? { synopsis: text } : {}) };
}

/**
 * Create a book or set up an existing folder as one: a title and an optional cover, offered from
 * the start. A cover needs a description (it is a picture of the book). An image picked here but
 * never saved is freed when replaced, removed, or the dialog is cancelled; the saved one stays
 * until a save replaces it.
 */
export function BookDialog({ folder, onSubmit, onClose }: Props) {
  const t = useT().studioBook.dialog;
  const creating = folder === null;
  const [genre, setGenre] = useState<DocumentKind | undefined>();
  const [synopsis, setSynopsis] = useState("");
  const saved = folder ? coverOf(folder) : null;
  const [name, setName] = useState(folder?.name ?? "");
  const c = useBookCover(saved);
  const { cover, error, busy } = c;

  async function cancel() {
    await c.discardPicked();
    onClose();
  }

  async function submit() {
    const problem = validateBook(name, cover);
    if (problem) return c.setError(t.errors[problem]);
    c.setBusy(true);
    try {
      await onSubmit({
        name: name.trim(),
        cover: cover && { fileId: cover.fileId, alt: cover.alt.trim() },
        ...introValues(creating, genre, synopsis),
      });
      await c.discardReplaced();
    } catch {
      c.setBusy(false);
      c.setError(t.saveFailed);
    }
  }

  const preview: StudioFolder = { ...(folder ?? { id: "new", createdAt: 0 }), name, kind: "book" };
  return (
    <Dialog
      open
      onClose={() => void cancel()}
      title={folder === null ? t.titleNew : t.titleEdit}
      actions={
        <>
          <Button variant="secondary" onClick={() => void cancel()}>
            {t.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={busy}>
            {folder === null ? t.submitNew : t.submitEdit}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        noValidate
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field id="book-title" label={t.titleLabel}>
          <Input id="book-title" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </Field>
        <IntroFields
          show={creating}
          genre={genre}
          synopsis={synopsis}
          onGenre={setGenre}
          onSynopsis={setSynopsis}
        />
        <div className="grid gap-3">
          <p className="text-sm font-medium">{t.coverLabel}</p>
          <div className="flex items-start gap-4">
            <CoverView folder={{ ...preview, cover: cover ?? undefined }} width={72} />
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
            <Field id="book-alt" label={t.altLabel} hint={t.altHint}>
              <Input id="book-alt" value={cover.alt} onChange={(e) => c.setAlt(e.target.value)} />
            </Field>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
