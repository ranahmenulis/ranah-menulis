"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useT } from "@/lib/i18n/provider";
import { closeJudging, reopenJudging } from "../../juri/judge-actions";
import { judgingStatus } from "../../juri/judge-model";
import { useJudgingLog } from "../../juri/score-store";
import { ReasonDialog } from "../../components/reason-dialog";
import type { ContestStage } from "@/features/projects/lomba/types";
import { isPlatformAdmin } from "@/lib/roles";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { Scales } from "@phosphor-icons/react/dist/ssr";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

/**
 * Closing judging (BR-PRJ-09). The Organizer closes it; once closed no Judge can change a score.
 * An Administrator can reopen it with a note that stays in the log. The result is said beside the
 * button, because the button that was pressed is gone afterwards.
 */
export function JudgingControls({ slug, stage }: { slug: string; stage: ContestStage }) {
  const t = useT().kelolaOrganizerTabs;
  const j = t.judging;
  const log = useJudgingLog();
  const admin = isPlatformAdmin(useEffectiveRoles());
  const status = judgingStatus(stage, log, slug);
  const [asking, setAsking] = useState<"tutup" | "buka" | null>(null);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);

  function done(text: string) {
    setAsking(null);
    setSaid(text);
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="penilaian-juri-title" className={cn(cardClass, "grid gap-3")}>
      <h3 id="penilaian-juri-title" className="flex items-center gap-2.5 heading-md">
        <SectionIcon icon={Scales} />
        {j.title}
      </h3>
      <p className="text-sm">{j.status[status]}</p>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      <div className="flex flex-wrap gap-2">
        {status === "dibuka" && (
          <Button variant="secondary" onClick={() => setAsking("tutup")}>
            {j.close}
          </Button>
        )}
        {status === "ditutup" && admin && (
          <Button variant="secondary" onClick={() => setAsking("buka")}>
            {j.reopen}
          </Button>
        )}
      </div>
      {status === "ditutup" && !admin && <p className="text-xs text-ink-muted">{j.adminOnly}</p>}
      {asking === "tutup" && (
        <Dialog
          open
          onClose={() => setAsking(null)}
          role="alertdialog"
          title={j.closeDialog.title}
          description={j.closeDialog.description}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                {t.common.cancel}
              </Button>
              <Button
                onClick={() => {
                  const result = closeJudging(slug, stage, Date.now());
                  done(result === "ok" ? j.closed : j.failed[result]);
                }}
              >
                {j.close}
              </Button>
            </>
          }
        />
      )}
      {asking === "buka" && (
        <ReasonDialog
          title={j.reopenDialog.title}
          hint={j.reopenDialog.hint}
          fieldLabel={j.reopenDialog.field}
          confirmLabel={j.reopenDialog.confirm}
          busy={false}
          onClose={() => setAsking(null)}
          onConfirm={(note) => {
            const result = reopenJudging(slug, note, Date.now());
            done(result === "ok" ? j.reopened : j.failed[result]);
          }}
        />
      )}
    </section>
  );
}
