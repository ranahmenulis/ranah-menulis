"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import {
  addTarget,
  MAX_TARGETS,
  parseTargetWords,
  removeTarget,
  sortTargets,
  targetLine,
  targetStatus,
  type AddFailure,
  type DocumentTarget,
} from "../document-targets";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Words in the document now: the progress of every target. */
  words: number;
  targets: DocumentTarget[];
  /** Today as "YYYY-MM-DD", or "" until the page has loaded. */
  today: string;
  onChange: (next: DocumentTarget[]) => void;
};

const FAILURES: Record<AddFailure, string> = {
  limit: `Satu dokumen punya paling banyak ${MAX_TARGETS} target.`,
  due: "Tenggat tidak boleh sebelum hari ini.",
  duplicate: "Target ini sudah ada.",
};
const WORDS_ERROR = "Isi angka bulat antara 1 dan 500.000.";

const STATUS_TEXT = { tercapai: "Tercapai", terlewat: "Terlewat", berjalan: "" } as const;

/**
 * Targets of one document (STK-08): a word count and an optional due day, several at once. They are
 * separate from the daily target and never touch the streak. Progress is the document's words.
 */
export function DocumentTargetsDialog({ open, onClose, words, targets, today, onChange }: Props) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const wordsInput = useRef<HTMLInputElement>(null);
  const full = targets.length >= MAX_TARGETS;
  const wordsError = error === WORDS_ERROR ? error : undefined;
  const dueError = error && error !== WORDS_ERROR && error !== FAILURES.limit ? error : undefined;

  function add() {
    const parsed = parseTargetWords(text);
    if (parsed === null) return setError(WORDS_ERROR);
    const result = addTarget(
      targets,
      { id: crypto.randomUUID(), words: parsed, due: due || null },
      today,
    );
    if (!result.ok) return setError(FAILURES[result.reason]);
    onChange(result.list);
    setText("");
    setDue("");
    setError(null);
    wordsInput.current?.focus();
  }

  function remove(id: string) {
    onChange(removeTarget(targets, id));
    // The button that was pressed is gone; keep keyboard focus inside the dialog.
    wordsInput.current?.focus();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      swipeToDismiss
      title="Target dokumen"
      description="Jumlah kata yang ingin dicapai dokumen ini, dengan atau tanpa tenggat. Terpisah dari target harian dan tidak memengaruhi streak."
      actions={<Button onClick={onClose}>Selesai</Button>}
    >
      <div className="grid gap-5">
        {targets.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada target untuk dokumen ini.</p>
        ) : (
          <ul aria-label="Target dokumen" className="border-t border-line">
            {sortTargets(targets).map((target) => {
              const status = targetStatus(target, words, today);
              return (
                <li
                  key={target.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-3 text-sm"
                >
                  <span className="min-w-0 tabular-nums">
                    {targetLine(target, words, today)}
                    {STATUS_TEXT[status] && status !== "tercapai" && (
                      <span className="ml-2 rounded-full border border-line px-2 py-px text-xs">
                        {STATUS_TEXT[status]}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="text"
                    size="sm"
                    aria-label={`Hapus target ${target.words.toLocaleString("id-ID")} kata`}
                    onClick={() => remove(target.id)}
                  >
                    Hapus
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <form
          noValidate
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Field id="target-words" label="Jumlah kata" error={wordsError}>
            <Input
              id="target-words"
              ref={wordsInput}
              inputMode="numeric"
              value={text}
              disabled={full}
              aria-invalid={wordsError ? true : undefined}
              aria-describedby={describedBy("target-words", { error: wordsError })}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
          <Field id="target-due" label="Tenggat" optional error={dueError}>
            <Input
              id="target-due"
              type="date"
              value={due}
              min={today || undefined}
              disabled={full}
              aria-invalid={dueError ? true : undefined}
              aria-describedby={describedBy("target-due", { error: dueError })}
              onChange={(e) => setDue(e.target.value)}
            />
          </Field>
          {full && <p className="text-xs text-ink-muted">{FAILURES.limit}</p>}
          <Button type="submit" variant="secondary" disabled={full || today === ""}>
            Tambah target
          </Button>
        </form>
      </div>
    </Dialog>
  );
}
