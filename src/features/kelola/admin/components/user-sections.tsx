import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { projectHref } from "@/features/projects/project-model";
import type { AuditEntry } from "../../audit/audit-log";
import { auditSentence } from "../../audit/audit-text";
import { staffRoleLabel } from "../../staff-assignments";
import { blockMessage, type RuleBlock } from "../role-rules";
import type { UserAssignment } from "../use-admin-data";

const dateText = (at: number) =>
  new Date(at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export function AccountSection({
  suspended,
  block,
  onAsk,
}: {
  suspended: boolean;
  block: RuleBlock | null;
  onAsk: () => void;
}) {
  return (
    <section aria-labelledby="akun-title" className="grid gap-2">
      <h2 id="akun-title" className="heading-md">
        Akun
      </h2>
      {suspended && <Notice>Akun ini ditangguhkan: rolenya tidak berlaku.</Notice>}
      {block ? (
        <p className="text-sm text-ink-muted">{blockMessage[block]}</p>
      ) : (
        <div>
          <Button variant={suspended ? "secondary" : "danger-text"} onClick={onAsk}>
            {suspended ? "Pulihkan akun" : "Tangguhkan akun"}
          </Button>
        </div>
      )}
    </section>
  );
}

export function AssignmentsSection({ assignments }: { assignments: UserAssignment[] }) {
  return (
    <section aria-labelledby="tugas-title" className="grid gap-2">
      <h2 id="tugas-title" className="heading-md">
        Penugasan
      </h2>
      {assignments.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ditugaskan di proyek mana pun.</p>
      ) : (
        <ul className="border-t border-line">
          {assignments.map((a) => (
            <li key={`${a.slug}-${a.role}`} className="border-b border-line py-2 text-sm">
              <Link href={projectHref(a.slug)} className="wrap-anywhere">
                {a.title}
              </Link>
              <span className="text-ink-muted"> · {staffRoleLabel[a.role]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HistorySection({ history }: { history: AuditEntry[] }) {
  return (
    <section aria-labelledby="riwayat-title" className="grid gap-2">
      <h2 id="riwayat-title" className="heading-md">
        Riwayat
      </h2>
      {history.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada perubahan tercatat.</p>
      ) : (
        <ul className="border-t border-line">
          {history.map((e) => (
            <li key={e.id} className="grid gap-0.5 border-b border-line py-2 text-sm">
              <span>{auditSentence(e)}</span>
              <span className="text-xs text-ink-muted">
                {dateText(e.at)}
                {e.reason ? ` · ${e.reason}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
