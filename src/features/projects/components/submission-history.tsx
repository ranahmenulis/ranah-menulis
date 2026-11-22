"use client";

import { StatusSubmission } from "@/components/ui/status-submission";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { sentAtText, versionSizeText } from "../submission-text";
import type { Submission, SubmissionVersion } from "../submission-types";
import { Section } from "./category-blocks";

/** Every change of status, newest first: who, when and why (BR-PRJ-05). */
export function StatusHistory({ work }: { work: Submission }) {
  const t = useT().projectsFlow;
  const locale = useLocale();
  const changes = [...work.statusLog].reverse();
  return (
    <Section title={t.detail.history.status}>
      <ol className="grid">
        {changes.map((change, i) => (
          <li
            key={`${change.status}-${change.at}-${i}`}
            className="grid gap-1 border-b border-line py-3"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusSubmission status={change.status} />
              <p className="text-xs text-ink-muted">
                {sentAtText(change.at, locale)} · {t.who[change.by]}
              </p>
            </div>
            {change.reason && <p className="text-sm wrap-anywhere">{change.reason}</p>}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function VersionRow({ version, latest }: { version: SubmissionVersion; latest: boolean }) {
  const t = useT().projectsFlow.detail.history;
  const locale = useLocale();
  return (
    <li className="grid gap-1 border-b border-line py-3">
      <p className="text-sm">
        <b className="font-medium">{fill(t.version, { n: String(version.version) })}</b>
        {latest && <span className="text-ink-muted">{t.latest}</span>}
        <span className="text-ink-muted">
          {" "}
          {fill(t.frozenMeta, {
            size: versionSizeText(version, locale),
            at: sentAtText(version.frozenAt, locale),
          })}
        </span>
      </p>
      <p className="text-xs text-ink-muted">
        {t.hash}{" "}
        <code className="font-mono wrap-anywhere" title={version.hash}>
          {version.hash.slice(0, 16)}…
        </code>
      </p>
    </li>
  );
}

/** The frozen versions, newest first. An older one stays as it was when a revision is sent. */
export function VersionHistory({ work }: { work: Submission }) {
  const t = useT().projectsFlow.detail.history;
  const versions = [...work.versions].reverse();
  return (
    <Section title={t.versions}>
      <ol className="grid">
        {versions.map((version, i) => (
          <VersionRow key={version.version} version={version} latest={i === 0} />
        ))}
      </ol>
    </Section>
  );
}
