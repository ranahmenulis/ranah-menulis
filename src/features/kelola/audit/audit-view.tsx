"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState, Notice } from "@/components/ui/states";
import { sentAtText } from "@/features/projects/submission-text";
import { ADMIN_HREF } from "../admin/area-hrefs";
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

const AUDIT_HREF = `${ADMIN_HREF}/audit`;

/** The audit log (PLT-05): read only, newest first. There is nothing here that changes an entry. */
export function AuditView() {
  const entries = useAuditLog();
  const judging = useJudgingLog();
  const asked = useSearchParams()?.get("jenis") ?? null;
  const [kind, setKind] = useState(() => parseAuditKind(asked));
  const [seen, setSeen] = useState(asked);
  const [shown, setShown] = useState(PAGE_SIZE);
  if (seen !== asked) {
    setSeen(asked);
    setKind(parseAuditKind(asked));
    setShown(PAGE_SIZE);
  }
  function change(next: AuditKind) {
    setKind(next);
    setShown(PAGE_SIZE);
    window.history.replaceState(null, "", `${AUDIT_HREF}${auditQuery(next)}`);
  }

  const rows = useMemo(() => logRows(entries, judging, kind), [entries, judging, kind]);

  return (
    <section aria-labelledby="audit-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="audit-title" className="heading-lg">
          Audit log
        </h1>
        <p className="text-sm text-ink-muted">Catatan tindakan sensitif: siapa, apa, dan kapan.</p>
      </div>
      <Notice>
        Log ini hanya bisa dibaca. Tidak ada yang bisa mengubah atau menghapus entrinya.
      </Notice>
      <div role="group" aria-label="Saring log" className="flex flex-wrap gap-2">
        {AUDIT_KINDS.map((k) => (
          <Chip key={k.id} pressed={k.id === kind} onClick={() => change(k.id)}>
            {k.label}
          </Chip>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState>Belum ada catatan.</EmptyState>
      ) : (
        <>
          <ul aria-label="Catatan" className="border-t border-line">
            {rows.slice(0, shown).map((e) => (
              <li key={e.id} className="grid gap-0.5 border-b border-line py-3 text-sm">
                <span className="wrap-anywhere">{auditSentence(e)}</span>
                <span className="text-xs text-ink-muted">
                  {sentAtText(e.at)}
                  {e.reason ? ` · ${e.reason}` : ""}
                </span>
              </li>
            ))}
          </ul>
          {rows.length > shown && (
            <Button
              variant="secondary"
              className="justify-self-start"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
            >
              Muat lebih banyak
            </Button>
          )}
        </>
      )}
    </section>
  );
}
