"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { format, useT } from "@/lib/i18n/provider";
import { useDeviceImport } from "../../hooks/use-device-import";

/**
 * Offers to copy the manuscripts a visitor wrote on this device into the account they signed in
 * to. A "not now" leaves a quiet link so the offer can always be found again. Draws nothing for
 * visitors or when nothing is waiting.
 */
export function DeviceImport({ enabled = true }: { enabled?: boolean }) {
  const t = useT().studioImport;
  const { state, run, setDismissed, close } = useDeviceImport();
  const statusRef = useRef<HTMLParagraphElement>(null);
  const linkRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const phase = state.phase;
  const folded = state.phase === "ready" && state.dismissed;

  // The result replaces the button that was pressed, so focus follows it.
  useEffect(() => {
    if (phase === "done" || phase === "error") statusRef.current?.focus();
  }, [phase]);

  // Folding or unfolding replaces the pressed button, so focus follows (never on first load).
  useEffect(() => {
    if (!moved.current) return;
    (folded ? linkRef : titleRef).current?.focus();
  }, [folded]);

  if (!enabled || state.phase === "idle") return null;

  if (state.phase === "ready" && state.dismissed) {
    return (
      <Button
        ref={linkRef}
        variant="text"
        size="sm"
        className="mt-3 px-0"
        onClick={() => {
          moved.current = true;
          setDismissed(false);
        }}
      >
        {format(t.link, { count: String(state.count) })}
      </Button>
    );
  }

  if (state.phase === "done") {
    const { documents: imported, folders, skipped } = state.summary;
    return (
      <div className={`${cardClass} mt-4`}>
        <p ref={statusRef} role="status" tabIndex={-1} className="text-sm text-ink outline-none">
          {imported + folders === 0 && skipped === 0
            ? t.nothing
            : [
                format(t.done, { imported: String(imported) }),
                folders > 0 ? format(t.doneFolders, { folders: String(folders) }) : "",
                skipped > 0 ? format(t.skipped, { skipped: String(skipped) }) : "",
              ]
                .filter(Boolean)
                .join(" ")}
        </p>
        <Button variant="text" size="sm" className="mt-2 px-0" onClick={close}>
          {t.close}
        </Button>
      </div>
    );
  }

  const busy = state.phase === "running";
  return (
    <section aria-labelledby="device-import-title" className={`${cardClass} mt-4`}>
      <h2
        id="device-import-title"
        ref={titleRef}
        tabIndex={-1}
        className="text-base font-semibold text-ink outline-none"
      >
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        {format(t.body, { count: String(state.count) })}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{t.note}</p>
      {state.phase === "error" && (
        <p
          ref={statusRef}
          role="alert"
          tabIndex={-1}
          className="mt-3 text-sm text-danger outline-none"
        >
          {t.failed}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => void run()}
          loading={busy}
          aria-busy={busy}
          disabled={busy}
        >
          {busy ? t.running : state.phase === "error" ? t.retry : t.copy}
        </Button>
        <Button
          variant="text"
          size="sm"
          disabled={busy}
          onClick={() => {
            moved.current = true;
            setDismissed(true);
          }}
        >
          {t.later}
        </Button>
      </div>
    </section>
  );
}
