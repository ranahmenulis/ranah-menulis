"use client";

import { fill } from "@/features/studio/copy/fill";
import { formatDateTime, formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { Section } from "@/components/ui/section-card";
import { sentAtText } from "../../submission-text";
import type { AssignmentChange, AssignmentSubmission } from "../types";

type HistoryCopy = ReturnType<typeof useT>["projectsClass"]["history"];

function lineOf(change: AssignmentChange, index: number, t: HistoryCopy): string {
  if (change.by === "mentor") return change.status === "selesai" ? t.mentorDone : t.mentorRepair;
  return index === 0 ? t.youFirst : t.youRepair;
}

/** The existing Indonesian format stays as it is; English reads "Nov 25, 2026, 14:05". */
const sentAt = (at: number, locale: Locale) =>
  locale === "id" ? sentAtText(at) : formatDateTime(at, locale);

/** Every change of status and every frozen version, newest last. The old versions stay (BR-STD-03). */
export function AssignmentHistory({ work }: { work: AssignmentSubmission }) {
  const t = useT().projectsClass.history;
  const { locale } = useFormat();
  return (
    <>
      <Section title={t.title}>
        <ol className="grid gap-3 text-sm">
          {work.statusLog.map((change, i) => (
            <li key={`${change.status}-${change.at}`} className="grid gap-0.5">
              <span>{lineOf(change, i, t)}</span>
              <span className="text-xs text-ink-muted">{sentAt(change.at, locale)}</span>
              {change.reason && change.by === "mentor" && (
                <span className="text-sm wrap-anywhere whitespace-pre-line text-ink-muted">
                  {change.reason}
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>
      <Section title={t.versions}>
        <ul className="grid gap-1 text-sm">
          {work.versions.map((v) => (
            <li key={v.version} className="text-ink-muted">
              <span className="text-ink">{fill(t.version, { n: String(v.version) })}</span> ·{" "}
              {fill(t.words, { n: formatNumber(v.wordCount, locale) })} ·{" "}
              {sentAt(v.frozenAt, locale)}
            </li>
          ))}
        </ul>
        <p className="text-xs wrap-anywhere text-ink-muted">
          {work.source === "teks" ? t.typed : fill(t.fromDocument, { title: work.docTitle })}
        </p>
      </Section>
    </>
  );
}
