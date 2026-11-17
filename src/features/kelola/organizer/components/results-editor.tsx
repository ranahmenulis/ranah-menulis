"use client";

import { useRef, useState } from "react";
import { isPlatformAdmin } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { Field, Input, Textarea, describedBy } from "@/components/ui/field";
import { EmptyState, Notice } from "@/components/ui/states";
import { storedResults } from "@/features/projects/lomba/results-store";
import type { ContestStage } from "@/features/projects/lomba/types";
import type { Submission } from "@/features/projects/submission-types";
import type { Project } from "@/features/projects/types";
import { ReasonDialog } from "../../components/reason-dialog";
import { judgingStatus, scoreText } from "../../juri/judge-model";
import { useEffectiveRoles } from "../../use-effective-roles";
import { useJudgingLog, useJuryScores } from "../../juri/score-store";
import { saveContestResults } from "../results-actions";
import {
  FINALISTS_KEY,
  inputOf,
  lockText,
  rankRows,
  resultsLock,
  type RankRow,
  type ResultsErrors,
  type ResultsInput,
} from "../results-model";

/**
 * Finalists and winners of a contest (LMB-02), decided from the Judges' scores. Saving does not
 * announce anything: the public page shows the results only when the Organizer moves the stage on.
 * Every failing rule shows at its row and nothing typed is lost. What may still change depends on
 * the stage and on whether judging is closed; the press of the button reads both again.
 */
export function ResultsEditor({
  project,
  stage,
  works,
}: {
  project: Project;
  stage: ContestStage;
  works: Submission[];
}) {
  const scores = useJuryScores();
  const log = useJudgingLog();
  const stored = storedResults.use();
  const criteria = project.block.kind === "lomba" ? project.block.criteria : [];
  const prizes = project.block.kind === "lomba" ? project.block.prizes.length : 0;
  const rows = rankRows(works, scores, criteria, project.slug);
  const lock = resultsLock(stage, judgingStatus(stage, log, project.slug));
  const saved = stored.find((r) => r.slug === project.slug);
  // After the winners are announced an Administrator can still correct them, with a reason that is
  // logged. Only results the Organizer recorded can be corrected; sample results are fixed.
  const admin = isPlatformAdmin(useEffectiveRoles());
  const amend = lock === "terkunci" && admin && saved !== undefined;

  return (
    <section aria-labelledby="hasil-title" className="grid gap-3 border-t border-line pt-5">
      <h3 id="hasil-title" className="heading-sm">
        Finalis dan pemenang
      </h3>
      {lock !== "terbuka" && (
        <Notice>
          {amend
            ? "Pemenang sudah diumumkan. Sebagai Administrator kamu masih bisa mengubahnya dengan alasan yang tercatat di audit log."
            : lockText[lock]}
        </Notice>
      )}
      {rows.length === 0 ? (
        <EmptyState>Belum ada karya yang dikirim ke lomba ini di perangkat ini.</EmptyState>
      ) : (
        <Form
          key={`${project.slug}-${lock}-${amend}-${rows.map((r) => r.id).join(",")}`}
          project={project}
          rows={rows}
          lock={lock}
          amend={amend}
          prizes={prizes}
          initial={inputOf(saved, rows)}
        />
      )}
    </section>
  );
}

/** What to say when a save did not go through and no row carries the message. */
function failureText(result: { reason: string; message?: string }): string {
  if (result.reason === "salah") return "";
  if (result.reason === "bukan-admin")
    return "Hanya Administrator yang bisa mengubah hasil yang sudah diumumkan.";
  if (result.reason === "alasan") return result.message ?? "";
  if (result.reason === "tidak-berubah") return "Tidak ada perubahan pada pemenang.";
  return lockText[result.reason === "terkunci" ? "terkunci" : "belum-ditutup"];
}

function Form({
  project,
  rows,
  lock,
  amend,
  prizes,
  initial,
}: {
  project: Project;
  rows: RankRow[];
  lock: ReturnType<typeof resultsLock>;
  amend: boolean;
  prizes: number;
  initial: ResultsInput;
}) {
  const [input, setInput] = useState<ResultsInput>(initial);
  const [errors, setErrors] = useState<ResultsErrors>({});
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const [asking, setAsking] = useState(false);
  const readOnly = lock === "belum-ditutup" || (lock === "terkunci" && !amend);
  const finalistsFixed = lock === "finalis-tetap" || amend;

  function submit(reason?: string) {
    const result = saveContestResults(
      project,
      rows,
      input,
      Date.now(),
      reason === undefined ? undefined : { reason },
    );
    if (result.ok) {
      setErrors({});
      setSaid(
        `Hasil disimpan: ${result.results.finalists.length} finalis, ${result.results.winners.length} pemenang. Belum tampil ke publik sebelum kamu mengumumkannya.`,
      );
    } else {
      setErrors(result.errors);
      setSaid(failureText(result));
      const first = Object.keys(result.errors)[0];
      if (first && first !== FINALISTS_KEY) document.getElementById(`hasil-${first}`)?.focus();
    }
    requestAnimationFrame(() => {
      if (document.activeElement === document.body) line.current?.focus();
    });
  }

  return (
    <form
      noValidate
      aria-label="Finalis dan pemenang"
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (amend) setAsking(true);
        else submit();
      }}
    >
      {errors[FINALISTS_KEY] && (
        <p role="alert" className="text-sm text-danger">
          {errors[FINALISTS_KEY]}
        </p>
      )}
      <ol aria-label="Peringkat karya" className="border-t border-line">
        {rows.map((row) => (
          <Row
            key={row.id}
            row={row}
            input={input}
            errors={errors}
            prizes={prizes}
            disabledFinalist={readOnly || finalistsFixed}
            disabledWinner={readOnly}
            set={(next) => setInput(next)}
          />
        ))}
      </ol>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {!readOnly && (
        <Button type="submit" className="justify-self-start">
          {amend ? "Ubah pemenang" : "Simpan hasil"}
        </Button>
      )}
      {asking && (
        <ReasonDialog
          title="Ubah pemenang setelah diumumkan"
          hint="Pengumuman berubah untuk semua pembaca. Perubahan dan alasannya tercatat di audit log."
          fieldLabel="Alasan perubahan"
          emptyMessage="Tulis alasan perubahannya. Alasan tercatat di audit log."
          confirmLabel="Ubah pemenang"
          busy={false}
          onConfirm={(reason) => {
            setAsking(false);
            submit(reason);
          }}
          onClose={() => setAsking(false)}
        />
      )}
    </form>
  );
}

function Row({
  row,
  input,
  errors,
  prizes,
  disabledFinalist,
  disabledWinner,
  set,
}: {
  row: RankRow;
  input: ResultsInput;
  errors: ResultsErrors;
  prizes: number;
  disabledFinalist: boolean;
  disabledWinner: boolean;
  set: (next: ResultsInput) => void;
}) {
  const finalist = input.finalists[row.id] ?? false;
  const rankId = `hasil-rank-${row.id}`;
  const noteId = `hasil-note-${row.id}`;
  return (
    <li className="grid gap-3 border-b border-line py-3">
      <div className="grid gap-0.5">
        <span className="font-medium wrap-anywhere">
          {row.label} · {row.title}
        </span>
        <span className="text-sm text-ink-muted">
          {row.genre} ·{" "}
          {row.score === null
            ? "Belum dinilai"
            : `Skor ${scoreText(row.score)} dari ${row.judges} juri`}
        </span>
      </div>
      <CheckChoice
        label="Finalis"
        checked={finalist}
        disabled={disabledFinalist}
        onChange={(e) =>
          set({ ...input, finalists: { ...input.finalists, [row.id]: e.target.checked } })
        }
      />
      {finalist && (
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <Field
            id={rankId}
            label="Peringkat"
            optional
            hint={`1 sampai ${prizes}`}
            error={errors[`rank-${row.id}`]}
          >
            <Input
              id={rankId}
              inputMode="numeric"
              disabled={disabledWinner}
              value={input.ranks[row.id] ?? ""}
              aria-invalid={errors[`rank-${row.id}`] ? true : undefined}
              aria-describedby={describedBy(rankId, {
                hint: true,
                error: errors[`rank-${row.id}`],
              })}
              onChange={(e) =>
                set({ ...input, ranks: { ...input.ranks, [row.id]: e.target.value } })
              }
            />
          </Field>
          <Field id={noteId} label="Catatan juri" optional error={errors[`note-${row.id}`]}>
            <Textarea
              id={noteId}
              rows={2}
              disabled={disabledWinner}
              value={input.notes[row.id] ?? ""}
              aria-invalid={errors[`note-${row.id}`] ? true : undefined}
              aria-describedby={describedBy(noteId, { error: errors[`note-${row.id}`] })}
              onChange={(e) =>
                set({ ...input, notes: { ...input.notes, [row.id]: e.target.value } })
              }
            />
          </Field>
        </div>
      )}
    </li>
  );
}
