"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { format, useT } from "@/lib/i18n/provider";
import { applyAction } from "../organizer-actions";
import type { StatusAction } from "../project-status";

/**
 * Publish, close, archive or delete (PRJ-03, BR-PRJ-07). Each asks first. The registrations and the
 * stored project are read again when the button is pressed. The result is said in words next to the
 * buttons, because the button that was pressed may be gone once the status changes.
 */
export function StatusActions({
  slug,
  actions,
  onDeleted,
}: {
  slug: string;
  actions: StatusAction[];
  onDeleted: () => void;
}) {
  const t = useT().kelolaOrganizer;
  const actionText = t.actions.text;
  const [asking, setAsking] = useState<StatusAction | null>(null);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);

  function confirm(action: StatusAction) {
    const result = applyAction(slug, action, Date.now());
    setAsking(null);
    if (result === "ok" && action === "hapus") return onDeleted();
    setSaid(
      result === "ok"
        ? format(t.actions.done, { label: actionText[action].label })
        : (t.actions.failed[result as keyof typeof t.actions.failed] ?? t.actions.fallback),
    );
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((action, i) => (
          <Button
            key={action}
            variant={action === "hapus" ? "danger-text" : i === 0 ? "secondary" : "text"}
            onClick={() => setAsking(action)}
          >
            {actionText[action].label}
          </Button>
        ))}
      </div>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {asking && (
        <Dialog
          open
          onClose={() => setAsking(null)}
          role={asking === "hapus" || asking === "arsipkan" ? "alertdialog" : "dialog"}
          title={actionText[asking].title}
          description={actionText[asking].body}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                {t.actions.cancel}
              </Button>
              <Button
                variant={asking === "hapus" ? "danger" : "primary"}
                onClick={() => confirm(asking)}
              >
                {actionText[asking].label}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
