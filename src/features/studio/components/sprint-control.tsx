"use client";

import { Timer } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, describedBy } from "@/components/ui/field";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
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

export const SPRINT_TRIGGER_ID = "sprint-trigger";

type SprintControlProps = {
  sprint: SprintApi;
  /** Live words of the document, to show the sprint's words so far. */
  words: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function StartForm({ onStart }: { onStart: (minutes: number) => void }) {
  const t = useT().studioEditor;
  const [text, setText] = useState("25");
  const minutes = parseMinutes(text);
  const error = text.trim() !== "" && minutes === null ? t.sprint.invalid : undefined;
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (minutes !== null) onStart(minutes);
      }}
    >
      <p className="font-medium">{t.sprint.title}</p>
      <p className="text-xs text-ink-muted">{t.sprint.intro}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.sprint.durations}>
        {SPRINT_PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={minutes === n}
            onClick={() => setText(String(n))}
            className={cn(
              "h-8 cursor-pointer rounded-full px-4 text-sm",
              minutes === n
                ? "bg-accent text-on-accent"
                : "bg-subtle text-ink hover:bg-accent-subtle",
            )}
          >
            {format(t.sprint.preset, { n: String(n) })}
          </button>
        ))}
      </div>
      <Field id="sprint-minutes" label={t.sprint.minutes} error={error}>
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
        {t.sprint.start}
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
  const t = useT().studioEditor;
  const fmt = useFormat();
  const left = remainingMs(state.startedAt, state.minutes, nowMs);
  return (
    <div className="grid gap-3">
      <p className="font-medium">{t.sprint.running}</p>
      <p className="font-serif text-3xl font-semibold tabular-nums" aria-hidden>
        {formatRemaining(left)}
      </p>
      <p className="text-ink-muted tabular-nums">
        {format(t.sprint.soFar, { n: fmt.number(sprintWords(state.startWords, words)) })}
      </p>
      <Button variant="secondary" onClick={onStop}>
        {t.sprint.stop}
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
  const t = useT().studioEditor;
  const locale = useLocale();
  return (
    <div className="grid gap-3">
      <p className="font-medium">{state.stopped ? t.sprint.stopped : t.sprint.done}</p>
      <p className="font-serif text-xl leading-7 font-semibold">{resultText(state, locale)}</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onAgain}>
          {t.sprint.again}
        </Button>
        <Button variant="text" onClick={onClose}>
          {t.sprint.close}
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
  const t = useT().studioEditor;
  const { state, nowMs } = sprint;
  const mobileLabel =
    state.phase === "running"
      ? formatRemaining(remainingMs(state.startedAt, state.minutes, nowMs))
      : state.phase === "done"
        ? t.sprint.triggerDone
        : "";
  const label = mobileLabel ? `${t.sprint.trigger} ${mobileLabel}` : t.sprint.trigger;

  const closeAndFocusTrigger = () => {
    onOpenChange(false);
    requestAnimationFrame(() => document.getElementById(SPRINT_TRIGGER_ID)?.focus());
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      label={t.sprint.title}
      className="max-md:static"
      panelClassName="w-72 p-4 text-sm max-md:inset-x-4 max-md:w-auto"
      renderTrigger={(props) => (
        <button
          {...props}
          id={SPRINT_TRIGGER_ID}
          type="button"
          aria-label={label}
          title={t.sprint.title}
          className={cn(
            "inline-flex min-h-8 cursor-pointer items-center text-xs whitespace-nowrap text-ink-muted tabular-nums hover:text-ink hover:underline hover:underline-offset-3 aria-expanded:text-ink aria-expanded:underline aria-expanded:underline-offset-3",
            state.phase === "idle" && "max-md:hidden",
            state.phase === "running" && "font-medium text-ink",
          )}
        >
          <span className="max-md:hidden">{label}</span>
          <span className="inline-flex items-center gap-1 md:hidden" aria-hidden>
            <Timer size={14} />
            {mobileLabel}
          </span>
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
  const t = useT().studioEditor;
  const locale = useLocale();
  const message =
    state.phase === "running"
      ? format(t.sprint.started, { duration: spokenDuration(state.minutes * 60_000, locale) })
      : state.phase === "done"
        ? `${state.stopped ? t.sprint.stopped : t.sprint.done}: ${resultText(state, locale)}.`
        : "";
  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}
