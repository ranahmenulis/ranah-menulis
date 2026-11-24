"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { useT } from "@/lib/i18n/provider";
import { parseKind, type DocumentKind } from "../../document-classification";
import { studioStore } from "../../storage/store";
import { workHref } from "../../works";

/**
 * "Naskah baru": a title and an optional type. The work is created at once, so it opens on its
 * own page before the first word.
 */
export function NewWorkDialog({
  collectionId,
  onClose,
}: {
  collectionId: string | null;
  onClose: () => void;
}) {
  const t = useT().studioDocuments;
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DocumentKind | undefined>();
  const [failed, setFailed] = useState(false);
  const trimmed = name.trim();

  async function create() {
    if (!trimmed) return;
    const id = crypto.randomUUID();
    try {
      const created = await studioStore.save(
        {
          id,
          title: trimmed,
          content: { type: "doc", content: [] },
          wordCount: 0,
          folderId: collectionId,
        },
        0,
      );
      if (!created.ok) throw new Error("conflict");
      // The type is optional; a failure to set it does not stop the work from being created.
      if (kind) await studioStore.updateClassification(id, {}, { kind }).catch(() => null);
    } catch {
      setFailed(true);
      return;
    }
    onClose();
    router.push(workHref({ id }));
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={t.dialogs.newWork.title}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.dialogs.cancel}
          </Button>
          <Button type="submit" form="new-work-form" disabled={!trimmed}>
            {t.dialogs.newWork.submit}
          </Button>
        </>
      }
    >
      <form
        id="new-work-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <Field id="new-work-title" label={t.dialogs.newWork.label}>
          <Input
            id="new-work-title"
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setFailed(false);
            }}
          />
        </Field>
        <Field id="new-work-kind" label={t.classification.kindLabel} optional>
          <Select
            id="new-work-kind"
            value={kind ?? ""}
            onChange={(e) => setKind(parseKind(e.target.value) ?? undefined)}
          >
            <option value="">{t.classification.noKind}</option>
            {Object.entries(t.kinds).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        {failed && (
          <p role="alert" className="text-sm text-danger">
            {t.list.saveFailed}
          </p>
        )}
      </form>
    </Dialog>
  );
}
