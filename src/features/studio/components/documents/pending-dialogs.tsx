"use client";

import { useRouter } from "next/navigation";
import { kirimHref } from "@/features/projects/submission-model";
import { SendToProjectDialog } from "../send-to-project-dialog";
import type { DocumentList } from "../../hooks/use-document-list";
import { DeleteDialog, MoveDialog, NameDialog } from "./document-dialogs";
import type { Pending } from "./pending";

/** "Kirim ke proyek" from the list: the dialog closes itself first, then the send page opens. */
function SendFromList({ docId, onClose }: { docId: string; onClose: () => void }) {
  const router = useRouter();
  return (
    <SendToProjectDialog
      open
      docId={docId}
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
}: {
  pending: Pending | null;
  list: DocumentList;
  onClose: () => void;
}) {
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
          title="Folder baru"
          label="Nama folder"
          initial=""
          submitLabel="Buat folder"
          onClose={onClose}
          onSubmit={(name) => run(() => list.createFolder(name))()}
        />
      );
    case "renameFolder":
      return (
        <NameDialog
          open
          required
          title="Ganti nama folder"
          label="Nama folder"
          initial={pending.name}
          submitLabel="Simpan"
          onClose={onClose}
          onSubmit={(name) => run(() => list.renameFolder(pending.id, name))()}
        />
      );
    case "rename":
      return (
        <NameDialog
          open
          required={false}
          title="Ganti nama dokumen"
          label="Judul"
          initial={pending.doc.title}
          submitLabel="Simpan"
          onClose={onClose}
          onSubmit={(name) => run(() => list.rename(pending.doc.id, name))()}
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
