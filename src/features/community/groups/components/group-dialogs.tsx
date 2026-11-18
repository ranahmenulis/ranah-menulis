"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { joinByCode, saveGroup } from "../group-actions";
import {
  GROUP_DESCRIPTION_LIMIT,
  GROUP_NAME_LIMIT,
  groupErrors,
  type GroupInput,
  type WritingGroup,
} from "../group-model";

function Cancel({ onClose }: { onClose: () => void }) {
  return (
    <Button variant="secondary" onClick={onClose}>
      Batal
    </Button>
  );
}

export function GroupSettingsDialog({
  group,
  admin = false,
  onSaved,
  onClose,
}: {
  group?: WritingGroup;
  admin?: boolean;
  onSaved: (id: string, message: string) => void;
  onClose: () => void;
}) {
  const [original] = useState(() =>
    group
      ? {
          id: group.id,
          name: group.name,
          description: group.description,
          visibility: group.visibility,
        }
      : undefined,
  );
  const [input, setInput] = useState<GroupInput>(() => ({
    name: original?.name ?? "",
    description: original?.description ?? "",
    visibility: original?.visibility ?? "privat",
  }));
  const formId = useId();
  const nameId = `${formId}-name`;
  const descriptionId = `${formId}-description`;
  const visibilityId = `${formId}-visibility`;
  const [attempted, setAttempted] = useState(false);
  const [failure, setFailure] = useState("");
  const name = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLTextAreaElement>(null);
  const errors = attempted ? groupErrors(input) : undefined;
  const submitLabel = group ? "Simpan perubahan" : "Buat grup";

  function submit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    const result = saveGroup(input, { original, fromAdmin: admin });
    if (result.ok && result.id) onSaved(result.id, result.message);
    else {
      const found = groupErrors(input);
      if (found.name) name.current?.focus();
      else if (found.description) description.current?.focus();
      else setFailure(result.message);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={group ? "Ubah grup" : "Buat Grup Penulis"}
      actions={
        <>
          <Cancel onClose={onClose} />
          <Button type="submit" form={formId}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="grid gap-4" noValidate>
        <Field
          id={nameId}
          label="Nama grup"
          hint={`Maksimal ${GROUP_NAME_LIMIT} karakter.`}
          error={errors?.name}
        >
          <Input
            id={nameId}
            ref={name}
            value={input.name}
            onChange={(event) => setInput({ ...input, name: event.target.value })}
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={describedBy(nameId, { hint: true, error: errors?.name })}
          />
        </Field>
        <Field
          id={descriptionId}
          label="Deskripsi"
          optional
          hint={`Maksimal ${GROUP_DESCRIPTION_LIMIT} karakter.`}
          error={errors?.description}
        >
          <Textarea
            id={descriptionId}
            ref={description}
            value={input.description}
            onChange={(event) => setInput({ ...input, description: event.target.value })}
            aria-invalid={Boolean(errors?.description)}
            aria-describedby={describedBy(descriptionId, {
              hint: true,
              error: errors?.description,
            })}
          />
        </Field>
        <Field id={visibilityId} label="Visibilitas">
          <Select
            id={visibilityId}
            value={input.visibility}
            onChange={(event) =>
              setInput({
                ...input,
                visibility: event.target.value === "publik" ? "publik" : "privat",
              })
            }
          >
            <option value="privat">Privat · dengan kode atau undangan</option>
            <option value="publik">Publik · bisa diikuti langsung</option>
          </Select>
        </Field>
        <Notice>
          [usulan] Anggota dapat melihat nama pengguna, judul dokumen, dan progres yang kamu pilih
          untuk dibagikan.
        </Notice>
        {failure && (
          <p role="alert" className="text-sm text-danger">
            {failure}
          </p>
        )}
      </form>
    </Dialog>
  );
}

export function JoinCodeDialog({
  onJoined,
  onClose,
}: {
  onJoined: (id: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const formId = useId();
  const codeId = `${formId}-code`;
  const field = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = joinByCode(code);
    if (result.ok && result.id) onJoined(result.id);
    else {
      setError(result.message);
      field.current?.focus();
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Gabung dengan kode"
      description="Masukkan kode dari Admin Grup. Setelah bergabung, anggota dapat melihat progres yang kamu pilih untuk dibagikan."
      actions={
        <>
          <Cancel onClose={onClose} />
          <Button type="submit" form={formId}>
            Gabung
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate>
        <Field id={codeId} label="Kode undangan" error={error || undefined}>
          <Input
            id={codeId}
            ref={field}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy(codeId, { error })}
          />
        </Field>
      </form>
    </Dialog>
  );
}
