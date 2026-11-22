import { useLocale, useT } from "@/lib/i18n/provider";
import { Section } from "../../components/category-blocks";
import { formatProjectDate } from "../../project-model";
import type { Project } from "../../types";
import { announcementDates, stageRank } from "../contest-model";
import type { ContestStage } from "../types";

/** When each step happens, so the page never leaves "belum diumumkan" without a date. */
export function ResultsSchedule({ project, stage }: { project: Project; stage: ContestStage }) {
  const c = useT().projectsContest;
  const locale = useLocale();
  const zone = project.timeZone;
  const { finalists, winners } = announcementDates(project);
  const steps = [
    { label: c.schedule.closed, at: project.closesAt, done: stageRank(stage) >= 1 },
    { label: c.schedule.finalists, at: finalists, done: stageRank(stage) >= 2 },
    { label: c.schedule.winners, at: winners, done: stageRank(stage) >= 3 },
  ].filter((s): s is { label: string; at: number; done: boolean } => s.at !== null);
  if (steps.length === 0) return null;
  return (
    <Section title={c.schedule.title}>
      <ol className="grid gap-2 text-sm">
        {steps.map((s) => (
          <li key={s.label} className="flex flex-wrap justify-between gap-x-4">
            <span>{s.label}</span>
            <span className="text-ink-muted">
              {formatProjectDate(s.at, zone, locale)}
              {s.done ? c.schedule.done : ""}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** The criteria and their weights, the same as on the project page: written once, shown here too. */
export function ResultsCriteria({ project }: { project: Project }) {
  const c = useT().projectsContest;
  if (project.block.kind !== "lomba") return null;
  const { criteria, anonymous } = project.block;
  return (
    <Section title={c.criteria.title}>
      <ul className="grid gap-1 text-sm">
        {criteria.map((c) => (
          <li key={c.name} className="flex justify-between gap-4">
            <span className="wrap-anywhere">{c.name}</span>
            <span className="text-ink-muted tabular-nums">{c.weight}%</span>
          </li>
        ))}
      </ul>
      {anonymous && <p className="text-xs text-ink-muted">{c.criteria.anonymous}</p>}
    </Section>
  );
}
