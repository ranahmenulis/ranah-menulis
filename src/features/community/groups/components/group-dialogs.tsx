"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { useToday } from "@/features/studio/hooks/use-today";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { KindFields } from "./kind-fields";
import { joinByCode, saveGroup, type GroupResult } from "../group-actions";
import { groupMessage } from "../group-messages";
import {
  GROUP_DESCRIPTION_LIMIT,
  GROUP_NAME_LIMIT,
  groupErrors,
  type GroupInput,
  type WritingGroup,
} from "../group-model";

const isStartCode = (code: string) =>
  code === "startRequired" || code === "startInvalid" || code === "startInPast";

function Cancel({ onClose }: { onClose: () => void }) {
  const t = useT().groups.dialogs;
  return (
    <Button variant="secondary" onClick={onClose}>
      {t.cancel}
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
  onSaved: (id: string, result: GroupResult) => void;
  onClose: () => void;
}) {
  const dict = useT().groups;
  const t = dict.dialogs;
  const locale = useLocale();
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
    kind: group?.kind ?? "permanent",
    startsOn: group?.startsOn ?? "",
  }));
  const today = useToday();

  const formId = useId();
  const kindId = `${formId}-kind`;
  const startId = `${formId}-start`;
  const start = useRef<HTMLInputElement>(null);
  const nameId = `${formId}-name`;
  const descriptionId = `${formId}-description`;
  const visibilityId = `${formId}-visibility`;
  const [attempted, setAttempted] = useState(false);
  const [failure, setFailure] = useState("");
  const [startCode, setStartCode] = useState<
    "startRequired" | "startInvalid" | "startInPast" | null
  >(null);
  const name = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLTextAreaElement>(null);
  const errors = attempted ? groupErrors(input) : undefined;
  const submitLabel = group ? t.save : t.create;
  const issue = (code?: Parameters<typeof groupMessage>[0]) =>
    code ? groupMessage(code, dict.messages, locale) : undefined;
  const startError = startCode ? issue(startCode) : undefined;

  function submit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setStartCode(null);
    const result = saveGroup(input, { original, fromAdmin: admin, today: today || undefined });
    if (result.ok && result.id) onSaved(result.id, result);
    else {
      const found = groupErrors(input);
      if (found.name) name.current?.focus();
      else if (found.description) description.current?.focus();
      else if (isStartCode(result.code)) {
        setStartCode(result.code as "startRequired" | "startInvalid" | "startInPast");
        start.current?.focus();
      } else setFailure(groupMessage(result.code, dict.messages, locale));
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={group ? t.editTitle : t.createTitle}
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
          label={t.nameLabel}
          hint={format(t.limitHint, { limit: String(GROUP_NAME_LIMIT) })}
          error={issue(errors?.name)}
        >
          <Input
            id={nameId}
            ref={name}
            value={input.name}
            onChange={(event) => setInput({ ...input, name: event.target.value })}
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={describedBy(nameId, { hint: true, error: issue(errors?.name) })}
          />
        </Field>
        <Field
          id={descriptionId}
          label={t.descriptionLabel}
          optional
          hint={format(t.limitHint, { limit: String(GROUP_DESCRIPTION_LIMIT) })}
          error={issue(errors?.description)}
        >
          <Textarea
            id={descriptionId}
            ref={description}
            value={input.description}
            onChange={(event) => setInput({ ...input, description: event.target.value })}
            aria-invalid={Boolean(errors?.description)}
            aria-describedby={describedBy(descriptionId, {
              hint: true,
              error: issue(errors?.description),
            })}
          />
        </Field>
        <Field id={visibilityId} label={t.visibilityLabel}>
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
            <option value="privat">{t.privateOption}</option>
            <option value="publik">{t.publicOption}</option>
          </Select>
        </Field>
        <KindFields
          group={group}
          input={input}
          onChange={setInput}
          ids={{ kind: kindId, start: startId }}
          startRef={start}
          error={startError}
        />
        <Notice>{t.notice}</Notice>
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
  const dict = useT().groups;
  const t = dict.dialogs;
  const locale = useLocale();
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
      setError(groupMessage(result.code, dict.messages, locale));
      field.current?.focus();
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={t.codeTitle}
      description={t.codeBody}
      actions={
        <>
          <Cancel onClose={onClose} />
          <Button type="submit" form={formId}>
            {t.join}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate>
        <Field id={codeId} label={t.codeLabel} error={error || undefined}>
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
