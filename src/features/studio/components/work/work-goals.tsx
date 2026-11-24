"use client";

import { Target, Trophy } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { sortTargets, targetLine, targetStatus, type DocumentTarget } from "../../document-targets";
import { DocumentTargetsDialog } from "../document-targets-dialog";

function Bar({ done, goal }: { done: number; goal: number }) {
  const share = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;
  return (
    <span aria-hidden className="mt-2 block h-1.5 overflow-hidden rounded-full bg-subtle">
      <span className="block h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
    </span>
  );
}

/**
 * Targets of the whole work (STK-08) in one card: those still being worked on with their
 * progress, then how many are reached. Targets are word counts with an optional deadline, set in
 * the editor's target dialog; for a book the words of all chapters count.
 */
export function WorkGoals({
  words,
  targets,
  today,
  onChange,
}: {
  words: number;
  targets: DocumentTarget[];
  /** The writer's day; empty until the clock has been read. */
  today: string;
  onChange: (next: DocumentTarget[]) => Promise<void>;
}) {
  const t = useT().studioWork.goals;
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const sorted = today ? sortTargets(targets) : [];
  const current = sorted.filter((target) => targetStatus(target, words, today) !== "tercapai");
  const reached = sorted.filter((target) => targetStatus(target, words, today) === "tercapai");

  return (
    <section aria-labelledby="work-goals" className={`${cardClass} flex flex-col`}>
      <h2 id="work-goals" className="flex items-center gap-2 heading-sm">
        <Target size={18} aria-hidden className="text-accent-ink" />
        {t.heading}
      </h2>
      {current.length === 0 ? (
        <div className="mt-3">
          <p className="text-sm">{t.setTitle}</p>
          <p className="mt-1 text-xs text-ink-muted">{t.setNote}</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4">
          {current.map((target) => (
            <li key={target.id} className="text-sm">
              {targetLine(target, words, today, locale)}
              <Bar done={words} goal={target.words} />
            </li>
          ))}
        </ul>
      )}
      {reached.length > 0 && (
        <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
          <Trophy size={16} aria-hidden className="text-accent-ink" />
          {format(t.reachedCount, { count: String(reached.length) })}
        </p>
      )}
      <div className="mt-auto pt-4">
        <Button variant="secondary" size="sm" disabled={!today} onClick={() => setOpen(true)}>
          {targets.length === 0 ? t.add : t.manage}
        </Button>
      </div>
      {failed && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {t.saveFailed}
        </p>
      )}
      {open && (
        <DocumentTargetsDialog
          open
          onClose={() => setOpen(false)}
          words={words}
          targets={targets}
          today={today}
          onChange={(next) => {
            setFailed(false);
            onChange(next).catch(() => setFailed(true));
          }}
        />
      )}
    </section>
  );
}
