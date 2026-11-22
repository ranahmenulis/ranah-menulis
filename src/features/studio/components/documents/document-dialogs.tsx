"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { format, useT } from "@/lib/i18n/provider";
import type { StudioFolder } from "../../storage/document-store";

const FORM_ID = "name-form";

/** Rename a document or folder, or name a new folder. Remount with `key` to reset the field. */
export function NameDialog({
  open,
  title,
  label,
  initial,
  required,
  submitLabel,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  label: string;
  initial: string;
  /** Folders need a name; a document may be left untitled. */
  required: boolean;
  submitLabel: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const t = useT().studioDocuments;
  const [name, setName] = useState(initial);
  const trimmed = name.trim();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.dialogs.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={required && !trimmed}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={(e) => {
          e.preventDefault();
          if (!required || trimmed) onSubmit(trimmed);
        }}
      >
        <Field id="name-field" label={label}>
          <Input id="name-field" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </Field>
      </form>
    </Dialog>
  );
}

export function MoveDialog({
  open,
  folders,
  current,
  onSubmit,
  onClose,
}: {
  open: boolean;
  folders: StudioFolder[];
  current: string | null;
  onSubmit: (folderId: string | null) => void;
  onClose: () => void;
}) {
  const t = useT().studioDocuments.dialogs;
  const [value, setValue] = useState(current ?? "");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.move.title}
      description={folders.length === 0 ? t.move.noFolders : undefined}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button disabled={value === (current ?? "")} onClick={() => onSubmit(value || null)}>
            {t.move.submit}
          </Button>
        </>
      }
    >
      <Field id="move-field" label={t.move.label}>
        <Select id="move-field" value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">{t.move.noFolder}</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
      </Field>
    </Dialog>
  );
}

/** Permanent delete: says exactly what disappears, and that it cannot be undone. */
export function DeleteDialog({
  open,
  title,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useT().studioDocuments;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      title={t.dialogs.delete.title}
      description={format(t.dialogs.delete.description, { title: title || t.untitled })}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.dialogs.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t.dialogs.delete.confirm}
          </Button>
        </>
      }
    />
  );
}
