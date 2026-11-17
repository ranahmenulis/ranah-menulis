"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, describedBy } from "@/components/ui/field";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import type { SprintApi } from "../hooks/use-sprint";
import {
  formatRemaining,
  parseMinutes,
  remainingMs,
  resultText,
  spokenDuration,
  sprintWords,
  SPRINT_PRESETS,
  type SprintState,
} from "../sprint";

const number = new Intl.NumberFormat("id-ID");
export const SPRINT_TRIGGER_ID = "sprint-trigger";

type SprintControlProps = {
  sprint: SprintApi;
  /** Live words of the document, to show the sprint's words so far. */
  words: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function StartForm({ onStart }: { onStart: (minutes: number) => void }) {
  const [text, setText] = useState("25");
  const minutes = parseMinutes(text);
  const error = text.trim() !== "" && minutes === null ? "Isi 1 sampai 180 menit." : undefined;
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (minutes !== null) onStart(minutes);
      }}
    >
      <p className="font-medium">Timer sprint</p>
      <p className="text-xs text-ink-muted">
        Tulis tanpa henti sampai waktu habis. Streak dan targetmu tidak berubah.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilihan durasi">
        {SPRINT_PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={minutes === n}
            onClick={() => setText(String(n))}
            className={cn(
              "h-8 cursor-pointer rounded-full px-4 text-sm",
              minutes === n ? "bg-ink text-on-ink" : "bg-subtle text-ink",
            )}
          >
            {n} mnt
          </button>
        ))}
      </div>
      <Field id="sprint-minutes" label="Menit" error={error}>
        <Input
          id="sprint-minutes"
          inputMode="numeric"
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy("sprint-minutes", { error })}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={minutes === null}>
        Mulai sprint
      </Button>
    </form>
  );
}

function Running({
  state,
  nowMs,
  words,
  onStop,
}: {
  state: Extract<SprintState, { phase: "running" }>;
  nowMs: number;
  words: number;
  onStop: () => void;
}) {
  const left = remainingMs(state.startedAt, state.minutes, nowMs);
  return (
    <div className="grid gap-3">
      <p className="font-medium">Sprint berjalan</p>
      <p className="font-serif text-3xl font-semibold tabular-nums" aria-hidden>
        {formatRemaining(left)}
      </p>
      <p className="text-ink-muted tabular-nums">
        {number.format(sprintWords(state.startWords, words))} kata sejauh ini
      </p>
      <Button variant="secondary" onClick={onStop}>
        Hentikan sprint
      </Button>
    </div>
  );
}

function Done({
  state,
  onAgain,
  onClose,
}: {
  state: Extract<SprintState, { phase: "done" }>;
  onAgain: () => void;
  onClose: () => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="font-medium">{state.stopped ? "Sprint dihentikan" : "Sprint selesai"}</p>
      <p className="font-serif text-xl leading-7 font-semibold">{resultText(state)}</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onAgain}>
          Mulai lagi
        </Button>
        <Button variant="text" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
}

/**
 * Sprint timer in the editor bar (STD-13). Idle it reads "Sprint" (hidden on phones, where the ⋯
 * menu opens it); running it shows the time left; finished it keeps the result until closed. The
 * countdown is not a live region: screen readers hear only the start and the end (SprintAnnouncer).
 */
export function SprintControl({ sprint, words, open, onOpenChange }: SprintControlProps) {
  const { state, nowMs } = sprint;
  const label =
    state.phase === "running"
      ? `Sprint ${formatRemaining(remainingMs(state.startedAt, state.minutes, nowMs))}`
      : state.phase === "done"
        ? "Sprint selesai"
        : "Sprint";

  const closeAndFocusTrigger = () => {
    onOpenChange(false);
    requestAnimationFrame(() => document.getElementById(SPRINT_TRIGGER_ID)?.focus());
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      label="Timer sprint"
      className="max-md:static"
      panelClassName="w-72 p-4 text-sm max-md:inset-x-4 max-md:w-auto"
      renderTrigger={(props) => (
        <button
          {...props}
          id={SPRINT_TRIGGER_ID}
          type="button"
          title="Timer sprint"
          className={cn(
            "inline-flex min-h-8 cursor-pointer items-center text-xs whitespace-nowrap text-ink-muted tabular-nums hover:text-ink hover:underline hover:underline-offset-3 aria-expanded:text-ink aria-expanded:underline aria-expanded:underline-offset-3",
            state.phase === "idle" && "max-md:hidden",
            state.phase === "running" && "font-medium text-ink",
          )}
        >
          {label}
        </button>
      )}
    >
      {state.phase === "idle" && (
        <StartForm
          onStart={(minutes) => {
            sprint.start(minutes);
            closeAndFocusTrigger();
          }}
        />
      )}
      {state.phase === "running" && (
        <Running state={state} nowMs={nowMs} words={words} onStop={sprint.stop} />
      )}
      {state.phase === "done" && (
        <Done
          state={state}
          onAgain={sprint.dismiss}
          onClose={() => {
            sprint.dismiss();
            closeAndFocusTrigger();
          }}
        />
      )}
    </Popover>
  );
}

/** One quiet announcement when a sprint starts and when it ends; silent in between. */
export function SprintAnnouncer({ state }: { state: SprintState }) {
  const message =
    state.phase === "running"
      ? `Sprint ${spokenDuration(state.minutes * 60_000)} dimulai.`
      : state.phase === "done"
        ? `${state.stopped ? "Sprint dihentikan" : "Sprint selesai"}: ${resultText(state)}.`
        : "";
  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}
