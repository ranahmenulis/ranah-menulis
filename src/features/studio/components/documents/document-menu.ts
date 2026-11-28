import type { MenuEntry } from "@/components/ui/menu";
import type { useToast } from "@/components/ui/toast";
import type { DocumentList } from "../../hooks/use-document-list";
import type { DocumentSummary } from "../../storage/document-store";
import type { DocumentCopy } from "./document-text";
import type { Pending } from "./pending";

type Options = {
  doc: DocumentSummary;
  t: DocumentCopy;
  list: DocumentList;
  toast: ReturnType<typeof useToast>;
  archiveBusy: boolean;
  onPending: (pending: Pending) => void;
  onArchiveAction: (action: "archive" | "duplicate", id: string) => void;
  /** Opens the note's own page (summary, cover, chapters); the row itself opens the editor. */
  onDetails?: () => void;
};

/** The ⋯ menu of an active document row. */
export function documentMenu({
  doc,
  t,
  list,
  toast,
  archiveBusy,
  onPending,
  onArchiveAction,
  onDetails,
}: Options): MenuEntry[] {
  const m = t.menu;
  return [
    ...(onDetails ? [{ id: "details", label: m.details, onSelect: onDetails }] : []),
    { id: "rename", label: m.rename, onSelect: () => onPending({ kind: "rename", doc }) },
    {
      id: "classification",
      label: m.classification,
      onSelect: () => onPending({ kind: "classification", doc }),
    },
    { id: "move", label: m.move, onSelect: () => onPending({ kind: "move", doc }) },
    {
      id: "duplicate",
      label: m.duplicate,
      disabled: archiveBusy,
      onSelect: () => onArchiveAction("duplicate", doc.id),
    },
    {
      id: "send",
      label: m.send,
      // Nothing to send while the document has no text, like Bagikan in the editor.
      disabled: doc.wordCount === 0,
      onSelect: () => onPending({ kind: "sendToProject", doc }),
    },
    { id: "export", label: m.export, hint: m.soon, disabled: true, onSelect: () => {} },
    {
      id: "archive",
      label: m.archive,
      disabled: archiveBusy,
      onSelect: () => onArchiveAction("archive", doc.id),
    },
    { id: "sep", type: "separator" },
    {
      id: "trash",
      label: m.trash,
      hint: m.trashHint,
      onSelect: async () => {
        try {
          if (!(await list.trash(doc.id))) {
            toast({ message: t.toast.statusChanged, tone: "error" });
            return;
          }
          toast({
            message: t.toast.trashed,
            action: { label: t.toast.undo, onSelect: () => list.restore(doc.id) },
          });
        } catch {
          toast({ message: t.toast.trashFailed, tone: "error" });
        }
      },
    },
  ];
}
