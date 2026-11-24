"use client";

import { useRef, useState } from "react";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";

/** Longest synopsis: a short summary, not the story. */
export const SYNOPSIS_LIMIT = 600;

/**
 * The synopsis, written in place: it reads like text until pointed at or focused, and is saved
 * when the field loses focus with a changed text. The outcome is spoken and shown under it; a
 * failed save keeps what was typed.
 */
export function SynopsisField({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (text: string) => Promise<void>;
}) {
  const t = useT().studioWork.summary;
  const { number } = useFormat();
  const [text, setText] = useState(initial);
  const [focused, setFocused] = useState(false);
  const saved = useRef(initial);
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");

  async function save() {
    setFocused(false);
    const next = text.trim();
    if (next === saved.current) return;
    try {
      await onSave(next);
      saved.current = next;
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div>
      <label htmlFor="work-synopsis" className="heading-sm">
        {t.synopsis}
      </label>
      <textarea
        id="work-synopsis"
        rows={4}
        maxLength={SYNOPSIS_LIMIT}
        value={text}
        placeholder={t.synopsisPlaceholder}
        aria-describedby="work-synopsis-count"
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("idle");
        }}
        onBlur={() => void save()}
        className="-mx-3 mt-1 block [field-sizing:content] w-[calc(100%+1.5rem)] resize-none rounded-lg border border-transparent bg-transparent px-3 py-2 font-serif text-base leading-relaxed text-ink placeholder:text-ink-muted hover:border-line focus:border-line-strong focus:bg-surface focus:outline-none"
      />
      <div className="mt-1 flex min-h-4 items-center justify-between gap-3 text-xs text-ink-muted">
        <span id="work-synopsis-count" className={focused ? undefined : "sr-only"}>
          {format(t.synopsisLimit, { count: number(text.length), limit: number(SYNOPSIS_LIMIT) })}
        </span>
        <span role="status" className={status === "failed" ? "text-danger" : undefined}>
          {status === "saved" ? t.synopsisSaved : status === "failed" ? t.synopsisFailed : ""}
        </span>
      </div>
    </div>
  );
}
