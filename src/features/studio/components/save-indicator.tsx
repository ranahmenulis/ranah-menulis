"use client";

import { CloudSlash } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatClock } from "../count-words";
import type { SaveStatus } from "../hooks/use-studio-document";

type SaveIndicatorProps = {
  status: SaveStatus;
  savedAt: Date | null;
  /** The browser is offline: changes stay on this device until a connection returns. */
  offline: boolean;
  className?: string;
};

const STAMP_AFTER_MS = 3000;

/**
 * Save state as small text in the editor bar, never a toast (DESIGN.md 7.2):
 * "Menyimpan…" → "Tersimpan" → after 3 seconds "Tersimpan 14.02". "Belum tersinkron" stays in ink,
 * weight 500, with a crossed cloud; it is deliberately not red because it is temporary.
 */
export function SaveIndicator({ status, savedAt, offline, className }: SaveIndicatorProps) {
  const t = useT().studioEditor;
  const locale = useLocale();
  const savedMs = savedAt?.getTime() ?? null;
  const [stampedFor, setStampedFor] = useState<number | null>(() =>
    savedMs !== null && Date.now() - savedMs >= STAMP_AFTER_MS ? savedMs : null,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (savedMs === null || status !== "saved") return;
    const wait = Math.max(0, STAMP_AFTER_MS - (Date.now() - savedMs));
    const timer = window.setTimeout(() => setStampedFor(savedMs), wait);
    return () => window.clearTimeout(timer);
  }, [savedMs, status]);

  const trouble = status === "failed" ? "failed" : offline ? "offline" : null;

  return (
    <span role="status" className={cn("inline-flex text-xs whitespace-nowrap", className)}>
      {trouble ? (
        <Popover
          open={open}
          onOpenChange={setOpen}
          label={trouble === "offline" ? t.save.aboutSync : t.save.aboutSave}
          className="max-md:static"
          panelClassName="left-0 right-auto w-75 origin-top-left p-3.5 text-sm max-md:inset-x-4 max-md:w-auto"
          renderTrigger={(props) => (
            <button
              {...props}
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-ink"
            >
              <CloudSlash size={16} aria-hidden />
              {trouble === "offline" ? t.save.offlineLabel : t.save.failedLabel}
            </button>
          )}
        >
          <p className="font-medium">
            {trouble === "offline" ? t.save.offlineTitle : t.save.failedTitle}
          </p>
          <p className="mt-1 text-ink-muted">
            {trouble === "offline" ? t.save.offlineBody : t.save.failedBody}
          </p>
        </Popover>
      ) : (
        <span className="text-ink-muted">
          {status === "draft" && t.save.draft}
          {status === "saving" && t.save.saving}
          {status === "saved" &&
            (savedAt && stampedFor === savedMs
              ? format(t.save.savedAt, { time: formatClock(savedAt, locale) })
              : t.save.saved)}
        </span>
      )}
    </span>
  );
}
