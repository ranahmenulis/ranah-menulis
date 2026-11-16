import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { actionFor, daysLeftLabel, feeLines } from "../project-model";
import { deadlineText, quotaText } from "../project-text";
import type { Project, ProjectState } from "../types";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm wrap-anywhere">{children}</dd>
    </div>
  );
}

type Props = { project: Project; state: ProjectState; now: number; guest: boolean };

/**
 * Right column of the project page (DESIGN.md 6.7): fee, quota, deadline, and the one action for
 * the state. Registration does not exist yet (6f-2), so the button is disabled; it already says
 * what it will do. Below lg the column moves above the document so the action stays reachable.
 */
export function ProjectAside({ project, state, now, guest }: Props) {
  const lines = feeLines(project);
  const quota = project.quota;
  const open = state === "buka" || state === "segera-tutup";

  return (
    <aside aria-label="Pendaftaran" className="grid content-start gap-5 border border-line p-5">
      <dl className="grid gap-4">
        <Fact label={project.block.kind === "solo" ? "Biaya paket" : "Biaya"}>
          {lines.length === 0 ? (
            "Gratis"
          ) : (
            <span className="grid">
              {project.block.kind === "solo" && <span className="text-ink-muted">Mulai dari</span>}
              {lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </span>
          )}
        </Fact>
        <Fact label="Kuota">
          {quota ? (
            <span className="grid gap-2">
              <span>{quotaText(project)}</span>
              <span aria-hidden className="block h-1 bg-line">
                <span
                  className="block h-1 bg-ink"
                  style={{
                    width: `${quota.total > 0 ? Math.min(100, (quota.taken / quota.total) * 100) : 100}%`,
                  }}
                />
              </span>
            </span>
          ) : (
            "Tanpa kuota"
          )}
        </Fact>
        <Fact label="Pendaftaran">
          <span className="grid">
            <span>{deadlineText(project, state)}</span>
            {open && project.closesAt !== null && (
              <span className="text-ink-muted">
                {daysLeftLabel(project.closesAt, now, project.timeZone)}
              </span>
            )}
          </span>
        </Fact>
      </dl>
      <div className="grid gap-2">
        <Button disabled className="w-full">
          {actionFor(state, guest)}
        </Button>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-ink-muted">Pendaftaran dibuka di langkah berikutnya.</p>
        )}
      </div>
    </aside>
  );
}
