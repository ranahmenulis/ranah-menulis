"use client";

import { useState } from "react";
import { useLocale, useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea, describedBy } from "@/components/ui/field";
import { addTask, updateTask } from "@/features/projects/kelas/mentor-task-store";
import {
  newTask,
  validateTask,
  type MentorTask,
  type TaskErrors,
  type TaskInput,
} from "@/features/projects/kelas/mentor-tasks";
import type { TimeZoneName } from "@/features/projects/types";

const FORM = "form-tugas";
const ORDER: (keyof TaskInput)[] = ["title", "instructions", "dueDate"];

/**
 * Write or change a task (KLS-03): a title, instructions and a deadline day (the end of that day
 * in the project's zone). Every failing rule shows at its field and nothing typed is lost. The
 * clock is read when the button is pressed. Mounted per use, so each opening starts fresh.
 */
export function TaskDialog({
  slug,
  zone,
  task,
  dueLocked = false,
  onClose,
  onSaved,
}: {
  slug: string;
  zone: TimeZoneName;
  /** The task being changed; absent when writing a new one. */
  task?: MentorTask;
  /** Hand-ins exist: the deadline stays, because their "late" marks were set against it. */
  dueLocked?: boolean;
  onClose: () => void;
  onSaved: (task: MentorTask, created: boolean) => void;
}) {
  const t = useT().kelolaMentor.taskDialog;
  const locale = useLocale();
  const [input, setInput] = useState<TaskInput>({
    title: task?.title ?? "",
    instructions: task?.instructions ?? "",
    dueDate: task?.dueDate ?? "",
  });
  const [errors, setErrors] = useState<TaskErrors>({});
  const set = (key: keyof TaskInput) => (value: string) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  function submit() {
    const now = Date.now();
    const found = validateTask(input, { zone, now, current: task?.dueDate, locale });
    setErrors(found);
    const first = ORDER.find((key) => found[key]);
    if (first) return document.getElementById(`tugas-${first}`)?.focus();
    if (task) {
      const next = {
        ...task,
        title: input.title.trim(),
        instructions: input.instructions.trim(),
        dueDate: input.dueDate,
      };
      updateTask(task.id, () => next);
      onSaved(next, false);
    } else {
      const created = newTask(input, slug, now);
      addTask(created);
      onSaved(created, true);
    }
  }

  const field = (key: keyof TaskInput) => ({
    id: `tugas-${key}`,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": describedBy(`tugas-${key}`, {
      hint: key === "dueDate" && dueLocked,
      error: errors[key],
    }),
  });

  return (
    <Dialog
      open
      onClose={onClose}
      title={task ? t.editTitle : t.newTitle}
      description={t.description}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button type="submit" form={FORM}>
            {task ? t.save : t.create}
          </Button>
        </>
      }
    >
      <form
        id={FORM}
        noValidate
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field id="tugas-title" label={t.titleLabel} error={errors.title}>
          <Input
            {...field("title")}
            value={input.title}
            onChange={(e) => set("title")(e.target.value)}
          />
        </Field>
        <Field
          id="tugas-instructions"
          label={t.instructionsLabel}
          hint={t.instructionsHint}
          error={errors.instructions}
        >
          <Textarea
            {...field("instructions")}
            value={input.instructions}
            onChange={(e) => set("instructions")(e.target.value)}
          />
        </Field>
        <Field
          id="tugas-dueDate"
          label={t.dueLabel}
          hint={dueLocked ? t.dueLockedHint : undefined}
          error={errors.dueDate}
        >
          <Input
            {...field("dueDate")}
            type="date"
            disabled={dueLocked}
            value={input.dueDate}
            onChange={(e) => set("dueDate")(e.target.value)}
          />
        </Field>
      </form>
    </Dialog>
  );
}
