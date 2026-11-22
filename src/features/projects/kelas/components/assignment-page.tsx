"use client";

import { useRef } from "react";
import { Notice } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import type { DocumentStore, StudioDocument } from "@/features/studio/storage/document-store";
import { Section } from "../../components/category-blocks";
import { MyShell } from "../../components/my-states";
import { formatProjectDate } from "../../project-model";
import { latestFeedback } from "../assignment-status";
import { dashboardHref, type AssignmentRow } from "../class-model";
import { dueText, moduleLabel, stateHintOf } from "../class-text";
import type { ClassData } from "../hooks/use-class";
import { useHandIn } from "../hooks/use-hand-in";
import type { AssignmentStore } from "../storage/assignment-store";
import { AssignmentHistory } from "./assignment-history";
import { HandInSection, JustSentNotice } from "./hand-in-section";
import { StatusTugas } from "./status-tugas";
import { ProjectStrip } from "../../components/project-strip";

type Ready = Extract<ClassData, { status: "ready" }>;

type Props = {
  data: Ready;
  row: AssignmentRow;
  docs: StudioDocument[];
  store: AssignmentStore;
  documents: Pick<DocumentStore, "get">;
};

/**
 * One assignment (PRD 17.5 "Halaman tugas"): the instructions, the deadline, what you handed in,
 * the mentor's note, and the one form that fits where it stands. A late hand-in is accepted and
 * marked, so past the deadline the form stays and says so [usulan, Q-27].
 */
export function AssignmentPage({ data, row, docs, store, documents }: Props) {
  const t = useT().projectsClass;
  const { locale } = useFormat();
  const { project, content } = data;
  const { assignment, submission, state } = row;
  const zone = project.timeZone;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { justSent, send } = useHandIn({ content, row, store, documents, titleRef });

  const repairing = state === "perlu-perbaikan";
  const feedback = repairing && submission ? latestFeedback(submission) : null;

  return (
    <MyShell back={{ href: dashboardHref(project.slug), label: t.backDashboard }}>
      <ProjectStrip project={project} />
      <header className="grid gap-2">
        <p className="text-xs wrap-anywhere text-ink-muted">
          {moduleLabel(assignment.module, locale)}
        </p>
        <h1 ref={titleRef} tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
          {assignment.title}
        </h1>
        <p className="text-sm text-ink-muted">{dueText(assignment.dueAt, zone, locale)}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          <StatusTugas state={state} />
          <p className="text-sm">{stateHintOf(state, locale)}</p>
        </div>
      </header>

      {justSent && <JustSentNotice kind={justSent} />}

      <Section title={t.page.instructions}>
        {assignment.instructions.map((paragraph, i) => (
          <p key={i} className="text-base wrap-anywhere">
            {paragraph}
          </p>
        ))}
      </Section>

      {state === "terkunci" && (
        <Notice>
          {fill(t.page.locked, { date: formatProjectDate(content.startsAt, zone, locale) })}
        </Notice>
      )}
      {feedback && (
        <Section title={t.page.feedback}>
          <p className="text-base wrap-anywhere whitespace-pre-line">{feedback}</p>
        </Section>
      )}
      <HandInSection row={row} docs={docs} onSend={send} />

      {submission && <AssignmentHistory work={submission} />}
    </MyShell>
  );
}
