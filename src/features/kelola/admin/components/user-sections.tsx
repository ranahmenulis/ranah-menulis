import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { formatDate } from "@/lib/i18n/format";
import { useLocale, useT } from "@/lib/i18n/provider";
import { projectHref } from "@/features/projects/project-model";
import type { AuditEntry } from "../../audit/audit-log";
import { auditSentence } from "../../audit/audit-text";
import { blockText, type RuleBlock } from "../role-rules";
import type { UserAssignment } from "../use-admin-data";
import { ClipboardText, ClockCounterClockwise, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

const LONG_DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

export function AccountSection({
  suspended,
  block,
  onAsk,
}: {
  suspended: boolean;
  block: RuleBlock | null;
  onAsk: () => void;
}) {
  const t = useT().kelolaAdmin.user;
  const locale = useLocale();
  return (
    <section aria-labelledby="akun-title" className={cn(cardClass, "grid min-w-0 gap-2")}>
      <h2 id="akun-title" className="flex items-center gap-2.5 heading-md">
        <SectionIcon icon={UserCircle} />
        {t.accountTitle}
      </h2>
      {suspended && <Notice>{t.suspendedNotice}</Notice>}
      {block ? (
        <p className="text-sm text-ink-muted">{blockText(block, locale)}</p>
      ) : (
        <div>
          <Button variant={suspended ? "secondary" : "danger-text"} onClick={onAsk}>
            {suspended ? t.restore : t.suspend}
          </Button>
        </div>
      )}
    </section>
  );
}

export function AssignmentsSection({ assignments }: { assignments: UserAssignment[] }) {
  const t = useT().kelolaAdmin;
  return (
    <section aria-labelledby="tugas-title" className={cn(cardClass, "grid min-w-0 gap-2")}>
      <h2 id="tugas-title" className="flex items-center gap-2.5 heading-md">
        <SectionIcon icon={ClipboardText} />
        {t.user.assignmentsTitle}
      </h2>
      {assignments.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.user.noAssignments}</p>
      ) : (
        <ul className="border-t border-line">
          {assignments.map((a) => (
            <li key={`${a.slug}-${a.role}`} className="border-b border-line py-2 text-sm">
              <Link href={projectHref(a.slug)} className="wrap-anywhere">
                {a.title}
              </Link>
              <span className="text-ink-muted"> · {t.roles[a.role]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HistorySection({ history }: { history: AuditEntry[] }) {
  const t = useT().kelolaAdmin.user;
  const locale = useLocale();
  return (
    <section aria-labelledby="riwayat-title" className={cn(cardClass, "grid min-w-0 gap-2")}>
      <h2 id="riwayat-title" className="flex items-center gap-2.5 heading-md">
        <SectionIcon icon={ClockCounterClockwise} />
        {t.historyTitle}
      </h2>
      {history.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.noHistory}</p>
      ) : (
        <ul className="border-t border-line">
          {history.map((e) => (
            <li key={e.id} className="grid gap-0.5 border-b border-line py-2 text-sm">
              <span>{auditSentence(e, locale)}</span>
              <span className="text-xs text-ink-muted">
                {formatDate(e.at, locale, LONG_DATE)}
                {e.reason ? ` · ${e.reason}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
