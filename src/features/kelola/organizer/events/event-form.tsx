"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { ErrorBanner, Notice } from "@/components/ui/states";
import type { WritingEvent } from "@/features/community/events/event-model";
import { useActionStatus } from "@/features/kelola/admin/use-action-status";
import { manageEventHref } from "./event-access";
import { inputOf, type EventInput, type FormIssues } from "./event-input";
import { saveWritingEvent } from "./manage-event-actions";

type Key = keyof EventInput;
type FieldInfo = {
  label: string;
  type?: "datetime-local" | "number" | "textarea";
  optional?: boolean;
};
const fields: Record<Key, FieldInfo> = {
  title: { label: "Judul event" },
  description: { label: "Deskripsi", type: "textarea" },
  rules: { label: "Aturan tantangan", type: "textarea" },
  zone: { label: "Zona waktu" },
  start: { label: "Mulai event", type: "datetime-local" },
  end: { label: "Selesai event", type: "datetime-local" },
  target: { label: "Target kata", type: "number" },
  capacity: { label: "Kuota peserta", type: "number", optional: true },
  sprintStart: { label: "Mulai sprint", type: "datetime-local", optional: true },
  sprintMinutes: { label: "Durasi sprint (menit)", type: "number", optional: true },
};
const basics = ["title", "description", "rules"] as const;
const schedule = ["zone", "start", "end", "target", "capacity"] as const;
const sprint = ["sprintStart", "sprintMinutes"] as const;

type EventFieldProps = {
  id: string;
  name: Key;
  value: string;
  disabled: boolean;
  error?: string;
  change: (name: Key, value: string) => void;
};

function EventField({ id, name, value, disabled, error, change }: EventFieldProps) {
  const { label, type, optional } = fields[name];
  const props = {
    id,
    value,
    disabled,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy(id, { error }),
  };
  return (
    <Field id={id} label={label} optional={optional} error={error}>
      {name === "zone" ? (
        <Select {...props} onChange={(e) => change(name, e.target.value)}>
          <option value="WIB">WIB · Jakarta</option>
          <option value="MYT">MYT · Kuala Lumpur</option>
        </Select>
      ) : type === "textarea" ? (
        <Textarea {...props} onChange={(e) => change(name, e.target.value)} />
      ) : (
        <Input {...props} type={type ?? "text"} onChange={(e) => change(name, e.target.value)} />
      )}
    </Field>
  );
}

function formValues(
  input: EventInput,
  current: EventInput,
  locked: boolean,
  sprintLocked: boolean,
) {
  return {
    ...input,
    zone: locked || sprintLocked ? current.zone : input.zone,
    start: locked ? current.start : input.start,
    end: locked ? current.end : input.end,
    target: locked ? current.target : input.target,
    sprintStart: sprintLocked ? current.sprintStart : input.sprintStart,
    sprintMinutes: sprintLocked ? current.sprintMinutes : input.sprintMinutes,
  };
}

export function EventForm({ event, now }: { event?: WritingEvent; now: number }) {
  const id = useId();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [input, setInput] = useState(() => inputOf(event));
  const [revision, setRevision] = useState(event?.revision);
  const [errors, setErrors] = useState<FormIssues>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { message, statusRef, show } = useActionStatus();
  const locked = Boolean(event?.scheduleLocked);
  const sprintLocked = Boolean(event?.sprint && now >= event.sprint.startsAt);
  const stale = event && revision !== event.revision;
  function fieldLocked(name: Key) {
    if (name === "zone") return locked || sprintLocked;
    if (name === "sprintStart" || name === "sprintMinutes") return sprintLocked;
    return locked && (name === "start" || name === "end" || name === "target");
  }
  const values = formValues(input, inputOf(event), locked, sprintLocked);

  function change(name: Key, value: string) {
    setInput((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setError("");
    show("");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    show("");
    const result = await saveWritingEvent(
      values,
      event && revision !== undefined ? { id: event.id, revision } : undefined,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      setErrors(result.errors ?? {});
      if (result.errors)
        requestAnimationFrame(() =>
          formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        );
      return;
    }
    if (event) {
      setRevision(result.revision);
      show("Perubahan event disimpan.", true);
    } else router.push(manageEventHref(result.id));
  }

  function field(name: Key) {
    return (
      <EventField
        key={name}
        id={`${id}-${name}`}
        name={name}
        value={values[name]}
        disabled={pending || fieldLocked(name)}
        error={errors[name]}
        change={change}
      />
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={(e) => void submit(e)} className="grid gap-6">
      <p role="status" ref={statusRef} tabIndex={-1} className="empty:hidden">
        {message}
      </p>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {stale && (
        <Notice
          action={
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => {
                setInput(inputOf(event));
                setRevision(event.revision);
                setErrors({});
                setError("");
              }}
            >
              Muat pengaturan terbaru
            </Button>
          }
        >
          Event diubah dari halaman lain. Memuat pengaturan terbaru akan mengganti isian ini.
        </Notice>
      )}
      <div className="grid gap-4">{basics.map((name) => field(name))}</div>
      <fieldset className="grid min-w-0 gap-4 border-t border-line pt-4">
        <legend className="pr-3 heading-md">Jadwal dan peserta</legend>
        {locked && (
          <Notice>Jadwal, zona waktu, dan target kata terkunci setelah ada peserta.</Notice>
        )}
        <p className="text-sm text-ink-muted">Kosongkan kuota jika jumlah peserta bebas.</p>
        {schedule.map(field)}
      </fieldset>
      <fieldset className="grid min-w-0 gap-4 border-t border-line pt-4">
        <legend className="pr-3 heading-md">Sprint bersama</legend>
        {sprintLocked ? (
          <Notice>Jadwal sprint terkunci setelah sesi mulai.</Notice>
        ) : (
          <p className="text-sm text-ink-muted">
            Isi waktu mulai dan durasi jika event memiliki sesi sprint.
          </p>
        )}
        {sprint.map(field)}
      </fieldset>
      <Button className="justify-self-start" type="submit" disabled={pending || Boolean(stale)}>
        {event ? "Simpan perubahan" : "Buat event"}
      </Button>
    </form>
  );
}
