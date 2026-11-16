import { Notice } from "@/components/ui/states";
import { authors } from "@/features/community/fixtures/authors";
import { AuthorLink } from "@/features/profile/author-link";
import { Section } from "../../components/category-blocks";
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
  const anonymous = project.block.kind === "lomba" && project.block.anonymous;
  const reveal = namesRevealed(anonymous, stage);
  const rows = finalistRows(results, mine);

  if (stageRank(stage) < stageRank("finalis")) {
    return (
      <Section title="Finalis dan pemenang">
        <Notice>Finalis belum diumumkan. Daftarnya tampil di halaman ini begitu diumumkan.</Notice>
      </Section>
    );
  }
  return (
    <>
      {stage === "pemenang" && <Winners project={project} results={results} />}
      <Section title="Finalis">
        {rows.length === 0 ? (
          <p className="text-sm text-ink-muted">Daftar finalis belum tersedia.</p>
        ) : (
          <ol className="grid">
            {rows.map(({ entry, mine: own }, i) => (
              <li key={entry.id} className="grid gap-0.5 border-b border-line py-3">
                <p className="text-base font-medium wrap-anywhere">{entry.title}</p>
                <p className="text-sm wrap-anywhere text-ink-muted">
                  {reveal ? <Person authorId={entry.authorId} /> : finalistLabel(i)}
                  {" · "}
                  {entry.genre}
                  {own ? " · karyamu" : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}

function Winners({ project, results }: { project: Project; results: ContestResults | null }) {
  const winners = results ? rankedWinners(results) : [];
  return (
    <Section title="Pemenang">
      {winners.length === 0 ? (
        <p className="text-sm text-ink-muted">Daftar pemenang belum tersedia.</p>
      ) : (
        <ol className="grid">
          {winners.map((w) => {
            const prize = prizeFor(project, w.rank);
            return (
              <li key={w.entry.id} className="grid gap-1 border-b border-line py-4">
                <p className="text-xs text-ink-muted">
                  Juara {w.rank}
                  {w.tie ? " (seri)" : ""}
                  {prize ? ` · ${prize}` : ""}
                </p>
                <p className="feed-title wrap-anywhere">{w.entry.title}</p>
                <p className="text-sm wrap-anywhere">
                  <Person authorId={w.entry.authorId} />
                  <span className="text-ink-muted"> · {w.entry.genre}</span>
                </p>
                <p className="text-sm wrap-anywhere text-ink-muted">Catatan juri: {w.jurorNote}</p>
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}
