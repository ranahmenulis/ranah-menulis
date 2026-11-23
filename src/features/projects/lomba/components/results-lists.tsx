import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";
import { Notice } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { authors } from "@/features/community/fixtures/authors";
import { AuthorLink } from "@/features/profile/author-link";
import { Section } from "@/components/ui/section-card";
import type { Project } from "../../types";
import {
  finalistLabel,
  finalistRows,
  namesRevealed,
  prizeFor,
  rankedWinners,
  stageRank,
} from "../contest-model";
import type { ContestResults, ContestStage } from "../types";

/** A person's name as a link to their profile, or the id when the author is not known. */
function Person({ authorId }: { authorId: string }) {
  const author = authors.find((a) => a.id === authorId);
  if (!author) return <span>{authorId}</span>;
  return <AuthorLink handle={author.handle}>{author.name}</AuthorLink>;
}

type Props = {
  project: Project;
  stage: ContestStage;
  results: ContestResults | null;
  /** The reader's own work, when a development panel made it a finalist. */
  mine: { title: string; genre: string; authorId: string } | null;
};

/**
 * The finalists, then the winners. Until the finalists are announced the page says so instead of
 * showing an empty list. An anonymous contest lists finalists by number until the winners are
 * announced [usulan]; the reader's own work is told apart so it can be found.
 */
export function ResultsLists({ project, stage, results, mine }: Props) {
  const c = useT().projectsContest.lists;
  const locale = useLocale();
  const anonymous = project.block.kind === "lomba" && project.block.anonymous;
  const reveal = namesRevealed(anonymous, stage);
  const rows = finalistRows(results, mine);

  if (stageRank(stage) < stageRank("finalis")) {
    return (
      <Section title={c.sectionBoth}>
        <Notice>{c.notYet}</Notice>
      </Section>
    );
  }
  return (
    <>
      {stage === "pemenang" && <Winners project={project} results={results} />}
      <Section title={c.finalists}>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-muted">{c.noFinalists}</p>
        ) : (
          <ol className="grid">
            {rows.map(({ entry, mine: own }, i) => (
              <li key={entry.id} className="grid gap-0.5 border-b border-line py-3 last:border-b-0">
                <p className="text-base font-medium wrap-anywhere">{entry.title}</p>
                <p className="text-sm wrap-anywhere text-ink-muted">
                  {reveal ? <Person authorId={entry.authorId} /> : finalistLabel(i, locale)}
                  {" · "}
                  {entry.genre}
                  {own ? c.mine : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}

/**
 * Winners arrive from the last place up, so the first prize lands last (rm-row-in steps of 45ms,
 * slightly uneven); "Juara 1" then pops once its row has settled (rm-pop steps of 14ms).
 */
export function winnerStep(index: number, count: number): { row: number; pop: number } {
  const row = (count - 1 - index) * 1.6 + (index % 2) * 0.4;
  return { row, pop: Math.round((row * 45 + 420) / 14) };
}

function Winners({ project, results }: { project: Project; results: ContestResults | null }) {
  const c = useT().projectsContest.lists;
  const winners = results ? rankedWinners(results) : [];
  return (
    <Section title={c.winners}>
      {winners.length === 0 ? (
        <p className="text-sm text-ink-muted">{c.noWinners}</p>
      ) : (
        <ol className="grid">
          {winners.map((w, index) => {
            const prize = prizeFor(project, w.rank);
            const { row, pop } = winnerStep(index, winners.length);
            return (
              <li
                key={w.entry.id}
                className={cn(
                  "rm-row-in grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 rounded-xl px-3 py-4",
                  w.rank === 1 && "bg-accent-subtle",
                )}
                style={{ "--i": row } as CSSProperties}
              >
                <span
                  aria-hidden
                  className={cn(
                    "row-span-4 grid size-10 place-items-center rounded-full text-sm font-bold",
                    w.rank === 1 ? "rm-pop bg-(--art-flame) text-white" : "bg-subtle text-ink-soft",
                  )}
                  style={w.rank === 1 ? ({ "--i": pop } as CSSProperties) : undefined}
                >
                  {w.rank === 1 ? <Trophy size={20} weight="fill" /> : w.rank}
                </span>
                <p className="text-xs text-ink-muted">
                  <span className={cn(w.rank === 1 && "font-semibold text-accent-ink")}>
                    {format(c.place, { rank: String(w.rank) })}
                  </span>
                  {w.tie ? c.tie : ""}
                  {prize ? ` · ${prize}` : ""}
                </p>
                <p className="feed-title wrap-anywhere">{w.entry.title}</p>
                <p className="text-sm wrap-anywhere">
                  <Person authorId={w.entry.authorId} />
                  <span className="text-ink-muted"> · {w.entry.genre}</span>
                </p>
                <p className="text-sm wrap-anywhere text-ink-muted">
                  {format(c.jurorNote, { note: w.jurorNote })}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}
