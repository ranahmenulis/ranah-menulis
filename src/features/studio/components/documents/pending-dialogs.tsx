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
import { NewWorkDialog } from "./new-work-dialog";
import { DeleteDialog, MoveDialog, NameDialog } from "./document-dialogs";
import { collectionsOf } from "../../works";
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
    case "newWork":
      return <NewWorkDialog collectionId={pending.collectionId} onClose={onClose} />;
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
            await list.createFolder(name, {
              kind: "book",
              ...(cover ? { cover } : {}),
              ...(pending.collectionId ? { collectionId: pending.collectionId } : {}),
            });
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
    case "classifyBook": {
      // A book keeps its type and tags on the folder; the dialog is the document one, fed a stand-in.
      const { folder } = pending;
      const standIn = (
        kind: StudioDocument["kind"],
        tags: string[] | undefined,
      ): StudioDocument => ({
        id: folder.id,
        title: folder.name,
        content: { type: "doc", content: [] },
        wordCount: 0,
        version: 1,
        updatedAt: folder.createdAt,
        kind,
        tags,
      });
      return (
        <DocumentClassificationDialog
          key={folder.id}
          doc={standIn(folder.genre, folder.tags)}
          onSave={async (_expected, changes) => {
            await list.updateFolder(folder.id, { genre: changes.kind, tags: changes.tags ?? [] });
            return { status: "saved", doc: standIn(changes.kind, changes.tags) };
          }}
          onSaved={onClose}
          onClose={onClose}
        />
      );
    }
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
    case "moveWork": {
      // A work goes into a plain folder only: a book is a work, not a place to file one.
      const { work } = pending;
      return (
        <MoveDialog
          open
          folders={collectionsOf(list.folders)}
          current={work.collectionId}
          onClose={onClose}
          onSubmit={(target) =>
            run(() =>
              work.type === "book"
                ? list.updateFolder(work.id, { collectionId: target })
                : list.moveTo(work.id, target),
            )()
          }
        />
      );
    }
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
