"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, Notice } from "@/components/ui/states";
import { sentAtText } from "@/features/projects/submission-text";
import { useT } from "@/lib/i18n/provider";
import { useLocale } from "@/lib/i18n/provider";
import { ADMIN_HREF } from "../admin/area-hrefs";
import { useUrlFilter } from "../use-url-filter";
import { useJudgingLog } from "../juri/score-store";
import { useAuditLog } from "./audit-log";
import {
  AUDIT_KINDS,
  PAGE_SIZE,
  auditQuery,
  logRows,
  parseAuditKind,
  type AuditKind,
} from "./audit-model";
import { auditSentence } from "./audit-text";
import { listCardClass } from "../components/list-card";

const AUDIT_HREF = `${ADMIN_HREF}/audit`;

/** The audit log (PLT-05): read only, newest first. There is nothing here that changes an entry. */
export function AuditView() {
  const t = useT().kelolaAudit;
  const locale = useLocale();
  const entries = useAuditLog();
  const judging = useJudgingLog();
  const [kind, change] = useUrlFilter(
    "jenis",
    parseAuditKind,
    (k: AuditKind) => `${AUDIT_HREF}${auditQuery(k)}`,
  );
  // How many rows are shown belongs to the kind it was set for; another kind starts again.
  const [page, setPage] = useState({ kind, size: PAGE_SIZE });
  const shown = page.kind === kind ? page.size : PAGE_SIZE;

  const rows = useMemo(() => logRows(entries, judging, kind), [entries, judging, kind]);

  return (
    <section aria-labelledby="audit-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="audit-title" className="heading-lg">
          {t.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.subtitle}</p>
      </div>
      <Notice>{t.notice}</Notice>
      <div role="group" aria-label={t.filterGroup} className="flex flex-wrap gap-2">
        {AUDIT_KINDS.map((k) => (
          <Chip key={k.id} pressed={k.id === kind} onClick={() => change(k.id)}>
            {t.kinds[k.id]}
          </Chip>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <>
          <ul aria-label={t.list} className={listCardClass}>
            {rows.slice(0, shown).map((e) => (
              <li key={e.id} className="grid gap-0.5 border-b border-line py-3 text-sm">
                <span className="wrap-anywhere">{auditSentence(e, locale)}</span>
                <span className="text-xs text-ink-muted">
                  {sentAtText(e.at, locale)}
                  {e.reason ? ` · ${e.reason}` : ""}
                </span>
              </li>
            ))}
          </ul>
          {rows.length > shown && (
            <Button
              variant="secondary"
              className="justify-self-start"
              onClick={() => setPage({ kind, size: shown + PAGE_SIZE })}
            >
              {t.more}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
