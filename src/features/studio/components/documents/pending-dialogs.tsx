"use client";

import { useRouter } from "next/navigation";
import type { ProjectCategory } from "@/features/projects/types";
import { bookDocId } from "../../book-source";
import { kirimHref } from "@/features/projects/submission-model";
import { useT } from "@/lib/i18n/provider";
import { SendToProjectDialog } from "../send-to-project-dialog";
import type { DocumentList } from "../../hooks/use-document-list";
import type { StudioDocument } from "../../storage/document-store";
import { BookDialog, bookPatch } from "../book/book-dialog";
import { DocumentClassificationDialog } from "./document-classification-dialog";
import { DeleteDialog, MoveDialog, NameDialog } from "./document-dialogs";
import type { Pending } from "./pending";

/** "Kirim ke proyek" from the list: the dialog closes itself first, then the send page opens. */
function SendFromList({
  docId,
  onClose,
  only,
}: {
  docId: string;
  onClose: () => void;
  only?: ProjectCategory[];
}) {
  const router = useRouter();
  return (
    <SendToProjectDialog
      open
      docId={docId}
      only={only}
      onClose={onClose}
      onPick={async (slug) => {
        onClose();
        router.push(kirimHref(slug, docId));
        return true;
      }}
    />
  );
}

/** Renders whichever dialog `pending` names, runs its action, and closes it first. */
export function PendingDialogs({
  pending,
  list,
  onClose,
  onClassified,
}: {
  pending: Pending | null;
  list: DocumentList;
  onClose: () => void;
  onClassified?: (doc: StudioDocument) => void;
}) {
  const t = useT().studioDocuments.dialogs;
  if (!pending) return null;
  const run = (action: () => Promise<void>) => async () => {
    onClose();
    await action();
  };

  switch (pending.kind) {
    case "newFolder":
      return (
        <NameDialog
          open
          required
          title={t.newFolder.title}
          label={t.newFolder.label}
          initial=""
          submitLabel={t.newFolder.submit}
          onClose={onClose}
          onSubmit={(name) => run(() => list.createFolder(name))()}
        />
      );
    case "sendBook":
      return (
        <SendFromList docId={bookDocId(pending.folder.id)} only={["solo"]} onClose={onClose} />
      );
    case "newBook":
      return (
        <BookDialog
          folder={null}
          onClose={onClose}
          onSubmit={async ({ name, cover }) => {
            await list.createFolder(name, { kind: "book", ...(cover ? { cover } : {}) });
            onClose();
          }}
        />
      );
    case "bookSettings":
      return (
        <BookDialog
          folder={pending.folder}
          onClose={onClose}
          onSubmit={async (values) => {
            await list.updateFolder(pending.folder.id, bookPatch(values));
            onClose();
          }}
        />
      );
    case "renameFolder":
      return (
        <NameDialog
          open
          required
          title={t.renameFolder.title}
          label={t.renameFolder.label}
          initial={pending.name}
          submitLabel={t.renameFolder.submit}
          onClose={onClose}
          onSubmit={(name) => run(() => list.renameFolder(pending.id, name))()}
        />
      );
    case "rename":
      return (
        <NameDialog
          open
          required={false}
          title={t.renameDocument.title}
          label={t.renameDocument.label}
          initial={pending.doc.title}
          submitLabel={t.renameDocument.submit}
          onClose={onClose}
          onSubmit={(name) => run(() => list.rename(pending.doc.id, name))()}
        />
      );
    case "classification":
      return (
        <DocumentClassificationDialog
          key={pending.doc.id}
          doc={pending.doc}
          onSave={(expected, changes) =>
            list.updateClassification(pending.doc.id, expected, changes)
          }
          onSaved={(doc) => {
            onClose();
            onClassified?.(doc);
          }}
          onClose={onClose}
        />
      );
    case "move":
      return (
        <MoveDialog
          open
          folders={list.folders}
          current={pending.doc.folderId ?? null}
          onClose={onClose}
          onSubmit={(target) => run(() => list.moveTo(pending.doc.id, target))()}
        />
      );
    case "sendToProject":
      return <SendFromList docId={pending.doc.id} onClose={onClose} />;
    case "delete":
      return (
        <DeleteDialog
          open
          title={pending.doc.title}
          onClose={onClose}
          onConfirm={run(() => list.deleteForever(pending.doc.id))}
        />
      );
  }
}
