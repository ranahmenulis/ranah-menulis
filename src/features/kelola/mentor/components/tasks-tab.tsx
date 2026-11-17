"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextLink } from "@/components/ui/text-link";
import { assignmentHref } from "@/features/projects/kelas/class-model";
import { dueText } from "@/features/projects/kelas/class-text";
import { removeTask } from "@/features/projects/kelas/mentor-task-store";
import { canDeleteTask, type MentorTask } from "@/features/projects/kelas/mentor-tasks";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { assignmentStore } from "@/features/projects/kelas/storage/store";
import type { AssignmentSubmission, ClassContent } from "@/features/projects/kelas/types";
import type { TimeZoneName } from "@/features/projects/types";
import { TaskDialog } from "./task-dialog";

type Props = {
  slug: string;
  zone: TimeZoneName;
  content: ClassContent;
  tasks: MentorTask[];
  submissions: AssignmentSubmission[];
  store?: AssignmentStore;
};

type Open =
  { kind: "new" } | { kind: "edit"; task: MentorTask } | { kind: "delete"; task: MentorTask };

/**
 * The tasks of the class. Those from the curriculum are read-only; the ones a mentor wrote can be
 * changed, and deleted only while nobody has handed one in (the work and its feedback would be
 * orphaned). The one filled button is "Buat tugas".
 */
export function TasksTab({
  slug,
  zone,
  content,
  tasks,
  submissions,
  store = assignmentStore,
}: Props) {
  const [open, setOpen] = useState<Open | null>(null);
  const [said, setSaid] = useState("");
  const newButton = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(null);
  /** Read the store again now: a hand-in may have arrived while the dialog was open. */
  async function confirmDelete(task: MentorTask) {
    let keep = true;
    try {
      keep = !canDeleteTask(task, await store.list());
      if (!keep) removeTask(task.id);
    } catch {
      close();
      setSaid(
        `Tugas “${task.title}” belum bisa dihapus karena data di perangkat ini tidak terbaca.`,
      );
      return;
    }
    close();
    setSaid(
      keep
        ? `Tugas “${task.title}” sudah punya pengumpulan, jadi tidak dihapus.`
        : `Tugas “${task.title}” dihapus.`,
    );
    newButton.current?.focus();
  }
  const countOf = (id: string) => submissions.filter((s) => s.assignmentId === id).length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">{content.modules.length} tugas di kelas ini.</p>
        <Button ref={newButton} onClick={() => setOpen({ kind: "new" })}>
          Buat tugas
        </Button>
      </div>
      <p role="status" className="min-h-5 text-sm">
        {said}
      </p>
      <ul className="border-t border-line">
        {content.modules.map(({ assignment, custom }) => {
          const task = custom ? tasks.find((t) => t.id === assignment.id) : undefined;
          const handed = countOf(assignment.id);
          return (
            <li
              key={assignment.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3"
            >
              <div className="grid min-w-0 gap-0.5">
                <TextLink
                  href={assignmentHref(slug, assignment.id)}
                  className="text-base font-medium wrap-anywhere"
                >
                  {assignment.title}
                </TextLink>
                <p className="text-xs wrap-anywhere text-ink-muted">
                  {task ? "Tugasmu" : "Dari kurikulum"} · {dueText(assignment.dueAt, zone)} ·{" "}
                  {handed} pengumpulan
                </p>
              </div>
              {task && (
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    variant="text"
                    size="sm"
                    aria-label={`Ubah tugas ${task.title}`}
                    onClick={() => setOpen({ kind: "edit", task })}
                  >
                    Ubah
                  </Button>
                  {canDeleteTask(task, submissions) ? (
                    <Button
                      variant="danger-text"
                      size="sm"
                      aria-label={`Hapus tugas ${task.title}`}
                      onClick={() => setOpen({ kind: "delete", task })}
                    >
                      Hapus
                    </Button>
                  ) : (
                    <span className="text-xs text-ink-muted">Sudah ada pengumpulan</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {open && open.kind !== "delete" && (
        <TaskDialog
          slug={slug}
          zone={zone}
          task={open.kind === "edit" ? open.task : undefined}
          dueLocked={open.kind === "edit" && !canDeleteTask(open.task, submissions)}
          onClose={close}
          onSaved={(saved, created) => {
            close();
            setSaid(
              created ? `Tugas “${saved.title}” dibuat.` : `Tugas “${saved.title}” disimpan.`,
            );
          }}
        />
      )}
      {open?.kind === "delete" && (
        <Dialog
          open
          onClose={close}
          role="alertdialog"
          title="Hapus tugas ini?"
          description={`“${open.task.title}” hilang dari dasbor peserta dan tidak bisa dikembalikan. Belum ada pengumpulan, jadi tidak ada pekerjaan peserta yang ikut hilang.`}
          actions={
            <>
              <Button variant="secondary" onClick={close}>
                Batal
              </Button>
              <Button variant="danger" onClick={() => void confirmDelete(open.task)}>
                Hapus tugas
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
