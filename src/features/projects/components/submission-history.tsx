import { StatusSubmission } from "@/components/ui/status-submission";
import { versionSizeText } from "../submission-text";
import { sentAtText } from "../submission-text";
import type { StatusChange, Submission, SubmissionVersion } from "../submission-types";
import { Section } from "./category-blocks";

const WHO: Record<StatusChange["by"], string> = {
  peserta: "oleh kamu",
  sistem: "oleh sistem",
  editor: "oleh peninjau",
};

/** Every change of status, newest first: who, when and why (BR-PRJ-05). */
export function StatusHistory({ work }: { work: Submission }) {
  const changes = [...work.statusLog].reverse();
  return (
    <Section title="Riwayat status">
      <ol className="grid">
        {changes.map((change, i) => (
          <li
            key={`${change.status}-${change.at}-${i}`}
            className="grid gap-1 border-b border-line py-3"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusSubmission status={change.status} />
              <p className="text-xs text-ink-muted">
                {sentAtText(change.at)} · {WHO[change.by]}
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
  return (
    <li className="grid gap-1 border-b border-line py-3">
      <p className="text-sm">
        <b className="font-medium">Versi {version.version}</b>
        {latest && <span className="text-ink-muted"> · terbaru</span>}
        <span className="text-ink-muted">
          {" "}
          · {versionSizeText(version)} · dibekukan {sentAtText(version.frozenAt)}
        </span>
      </p>
      <p className="text-xs text-ink-muted">
        Sidik SHA-256{" "}
        <code className="font-mono wrap-anywhere" title={version.hash}>
          {version.hash.slice(0, 16)}…
        </code>
      </p>
    </li>
  );
}

/** The frozen versions, newest first. An older one stays as it was when a revision is sent. */
export function VersionHistory({ work }: { work: Submission }) {
  const versions = [...work.versions].reverse();
  return (
    <Section title="Riwayat versi">
      <ol className="grid">
        {versions.map((version, i) => (
          <VersionRow key={version.version} version={version} latest={i === 0} />
        ))}
      </ol>
    </Section>
  );
}
