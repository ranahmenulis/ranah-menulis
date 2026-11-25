"use client";

import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/section-card";
import { personById } from "@/features/kelola/admin/people";
import { useToday } from "@/features/studio/hooks/use-today";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { freezeFinishedChallenge } from "../board-actions";
import { boardRows, challengeState } from "../board-model";
import type { WritingGroup } from "../group-model";

type Line = {
  key: string;
  rank: number;
  name: string;
  words: number;
  self: boolean;
  sample: boolean;
};

function liveLines(group: WritingGroup, reader: string, today: string, writer: string): Line[] {
  return boardRows(group, today).map((row) => ({
    key: row.authorId,
    rank: row.rank,
    name: personById(row.authorId)?.name ?? writer,
    words: row.words,
    self: row.authorId === reader,
    // Without a server only the reader's own words are real; everyone else is sample data.
    sample: row.authorId !== reader,
  }));
}

/** A line of the frozen result: someone who left has no name or identity any more. */
function archivedLines(group: WritingGroup, reader: string, leftMember: string): Line[] {
  return (group.finalBoard ?? []).map((row, i) => ({
    key: `${row.authorId ?? "left"}-${i}`,
    rank: row.rank,
    name: row.authorId === null || !row.name ? leftMember : row.name,
    words: row.words,
    self: row.authorId === reader,
    sample: row.authorId !== null && row.authorId !== reader,
  }));
}

/**
 * The ranking of a circle, for its members only. A running circle shows the live list of members
 * who opted in; a challenge whose last day has passed shows its frozen result, and freezes it the
 * first time a member opens the page afterwards.
 */
export function CircleBoard({ group, reader }: { group: WritingGroup; reader: string }) {
  const dict = useT().groups;
  const t = dict.board;
  const { number, date } = useFormat();
  const today = useToday();
  const state = today ? challengeState(group, today) : null;
  const finished = state === "finished";

  useEffect(() => {
    if (finished && !group.finalBoard) freezeFinishedChallenge(group.id, today);
  }, [finished, group.finalBoard, group.id, today]);

  if (!today) return null;
  const lines = finished
    ? archivedLines(group, reader, t.leftMember)
    : state === "upcoming"
      ? []
      : liveLines(group, reader, today, dict.view.writer);
  const top = Math.max(0, ...lines.map((line) => line.words));
  const [y, m, d] = (group.startsOn ?? today).split("-").map(Number);

  return (
    <Section
      id="circle-board"
      title={finished ? t.archive : t.title}
      icon={Trophy}
      className="gap-2"
    >
      {state === "upcoming" ? (
        <p className="text-sm text-ink-muted">
          {format(t.upcoming, {
            date: date(new Date(y, m - 1, d), { day: "numeric", month: "long", year: "numeric" }),
          })}
        </p>
      ) : lines.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.empty}</p>
      ) : (
        <ol aria-label={t.list} className="grid gap-2">
          {lines.map((line) => (
            <li
              key={line.key}
              className={cn(
                "grid gap-1.5 rounded-xl border px-3 py-2.5 text-sm",
                line.self ? "border-accent/40 bg-accent-subtle" : "border-line bg-surface",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-label={`${t.rank} ${line.rank}`}
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums",
                    line.rank === 1
                      ? "bg-accent text-on-accent"
                      : line.rank <= 3
                        ? "bg-accent-subtle text-accent-ink"
                        : "bg-subtle text-ink-muted",
                  )}
                >
                  {line.rank}
                </span>
                <span className="min-w-0 flex-1 wrap-anywhere">
                  <span className="font-medium">{line.name}</span>
                  {line.self && <span className="ml-2 text-xs text-accent-ink">{t.you}</span>}
                  {line.sample && (
                    <span className="ml-2 rounded-full bg-subtle px-2 py-0.5 text-xs text-ink-muted">
                      {t.sample}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {format(t.words, { count: number(line.words) })}
                </span>
              </div>
              <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{ width: `${top ? Math.round((line.words / top) * 100) : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
