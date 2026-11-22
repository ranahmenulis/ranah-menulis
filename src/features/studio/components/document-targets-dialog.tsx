"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
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

type DialogError = AddFailure | "words";

/**
 * Targets of one document (STK-08): a word count and an optional due day, several at once. They are
 * separate from the daily target and never touch the streak. Progress is the document's words.
 */
export function DocumentTargetsDialog({ open, onClose, words, targets, today, onChange }: Props) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState<DialogError | null>(null);
  const t = useT().studioEditor.targetsDialog;
  const locale = useLocale();
  const fmt = useFormat();
  const wordsInput = useRef<HTMLInputElement>(null);
  const full = targets.length >= MAX_TARGETS;
  const failureText = (code: AddFailure) => format(t.failures[code], { max: String(MAX_TARGETS) });
  const wordsError = error === "words" ? t.wordsError : undefined;
  const dueError = error === "due" || error === "duplicate" ? failureText(error) : undefined;

  function add() {
    const parsed = parseTargetWords(text);
    if (parsed === null) return setError("words");
    const result = addTarget(
      targets,
      { id: crypto.randomUUID(), words: parsed, due: due || null },
      today,
    );
    if (!result.ok) return setError(result.reason);
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
      title={t.title}
      description={t.description}
      actions={<Button onClick={onClose}>{t.done}</Button>}
    >
      <div className="grid gap-5">
        {targets.length === 0 ? (
          <p className="text-sm text-ink-muted">{t.none}</p>
        ) : (
          <ul aria-label={t.list} className="border-t border-line">
            {sortTargets(targets).map((target) => {
              const status = targetStatus(target, words, today);
              return (
                <li
                  key={target.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-3 text-sm"
                >
                  <span className="min-w-0 tabular-nums">
                    {targetLine(target, words, today, locale)}
                    {t.status[status] && status !== "tercapai" && (
                      <span className="ml-2 rounded-full border border-line px-2 py-px text-xs">
                        {t.status[status]}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="text"
                    size="sm"
                    aria-label={format(t.removeLabel, { n: fmt.number(target.words) })}
                    onClick={() => remove(target.id)}
                  >
                    {t.remove}
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
          <Field id="target-words" label={t.words} error={wordsError}>
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
          <Field id="target-due" label={t.due} optional error={dueError}>
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
          {full && <p className="text-xs text-ink-muted">{failureText("limit")}</p>}
          <Button type="submit" variant="secondary" disabled={full || today === ""}>
            {t.add}
          </Button>
        </form>
      </div>
    </Dialog>
  );
}
