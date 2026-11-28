"use client";

import { BookOpen, NotePencil } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { newDocumentHref } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";
import { studioStore } from "../../storage/store";
import { workHref } from "../../works";
import { BookDialog } from "../book/book-dialog";

function Choice({
  icon,
  label,
  hint,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition-colors duration-150 hover:bg-subtle focus-visible:bg-subtle"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-subtle text-accent-ink">
        {icon}
      </span>
      <span className="grid min-w-0 gap-1">
        <span className="heading-sm text-ink">{label}</span>
        <span className="text-sm text-ink-muted">{hint}</span>
      </span>
    </button>
  );
}

/**
 * "What do you want to write?": a note opens straight in the editor; a book asks for its title and
 * cover first, then opens on its chapters. Used by the mobile write button and "Naskah baru".
 */
export function NewWritingDialog({
  collectionId = null,
  onClose,
}: {
  /** The plain folder the new work is filed in, or null at the top level. */
  collectionId?: string | null;
  onClose: () => void;
}) {
  const t = useT().studioDocuments.dialogs;
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "book">("choose");

  if (step === "book") {
    return (
      <BookDialog
        folder={null}
        onClose={onClose}
        onSubmit={async ({ name, cover, genre, synopsis }) => {
          const book = await studioStore.createFolder(name, {
            kind: "book",
            ...(genre ? { genre } : {}),
            ...(synopsis ? { synopsis } : {}),
            ...(cover ? { cover } : {}),
            ...(collectionId ? { collectionId } : {}),
          });
          // Close first: a modal left open on the cached page would make the next page inert.
          onClose();
          router.push(workHref(book, "isi"));
        }}
      />
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={t.newWriting.title}
      actions={
        <Button variant="secondary" onClick={onClose}>
          {t.cancel}
        </Button>
      }
    >
      <div className="grid gap-3">
        <Choice
          icon={<NotePencil size={22} aria-hidden />}
          label={t.newWriting.note}
          hint={t.newWriting.noteHint}
          onSelect={() => {
            onClose();
            router.push(newDocumentHref(collectionId));
          }}
        />
        <Choice
          icon={<BookOpen size={22} aria-hidden />}
          label={t.newWriting.book}
          hint={t.newWriting.bookHint}
          onSelect={() => setStep("book")}
        />
      </div>
    </Dialog>
  );
}
