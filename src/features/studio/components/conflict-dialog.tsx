"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatClock } from "../count-words";
import { diffParagraphs, paragraphsOf } from "../diff-paragraphs";
import type { Conflict, ConflictChoice } from "../hooks/use-studio-document";

export type ConflictVersion = {
  title: string;
  savedAt: Date;
  words: number;
  paragraphs: string[];
};

type ConflictDialogProps = {
  open: boolean;
  local: ConflictVersion;
  remote: ConflictVersion;
  /** Resolves when the choice has been applied; the button shows a loading state meanwhile. */
  onResolve: (choice: ConflictChoice) => Promise<void> | void;
};

export function EditorConflictDialog({
  conflict,
  resolveConflict,
}: {
  conflict: Conflict | null;
  resolveConflict: (choice: ConflictChoice) => Promise<void>;
}) {
  const toast = useToast();
  const t = useT().studioEditor;
  const versions = useMemo(() => {
    if (!conflict) return null;
    const { local, remote } = conflict;
    return {
      local: {
        title: local.title,
        savedAt: new Date(),
        words: local.wordCount,
        paragraphs: paragraphsOf(local.content),
      },
      remote: {
        title: remote.title,
        savedAt: new Date(remote.updatedAt),
        words: remote.wordCount,
        paragraphs: paragraphsOf(remote.content),
      },
    };
  }, [conflict]);

  if (!versions) return null;
  return (
    <ConflictDialog
      open
      {...versions}
      onResolve={async (choice) => {
        await resolveConflict(choice);
        if (choice === "both") {
          toast({ message: t.conflict.toastBoth });
        }
      }}
    />
  );
}

const radio =
  "mt-px grid size-[18px] shrink-0 appearance-none place-items-center rounded-full border-[1.5px] border-ink bg-transparent " +
  "checked:after:size-2 checked:after:rounded-full checked:after:bg-ink checked:after:content-['']";

function VersionCard({
  name,
  version,
  differing,
  checked,
  picked,
  onPick,
}: {
  name: string;
  version: ConflictVersion;
  differing: Set<number>;
  /** This card's own radio. */
  checked: boolean;
  /** Border highlight; "keep both" also highlights the version this document keeps. */
  picked: boolean;
  onPick: () => void;
}) {
  const t = useT().studioEditor;
  const locale = useLocale();
  const shown = version.paragraphs.flatMap((text, index) =>
    differing.has(index) ? [{ text, index }] : [],
  );
  return (
    <label
      className={cn(
        "grid min-w-0 cursor-pointer content-start gap-3 border bg-surface p-4",
        picked ? "border-line-strong shadow-[inset_0_0_0_1px_var(--line-strong)]" : "border-line",
      )}
    >
      <span className="flex items-start gap-3 text-sm font-medium">
        <input type="radio" name="conflict" checked={checked} onChange={onPick} className={radio} />
        <span className="min-w-0">
          {name}
          <span className="block text-xs font-normal text-ink-muted">
            {format(t.conflict.cardMeta, {
              time: formatClock(version.savedAt, locale),
              n: String(version.words),
            })}
          </span>
        </span>
      </span>
      {shown.length === 0 && <span className="text-xs text-ink-muted">{t.conflict.titleOnly}</span>}
      {shown.map(({ text, index }) => (
        <p key={index} className="font-serif text-base leading-[26px] break-words">
          <span className="bg-subtle underline decoration-1 underline-offset-3">{text}</span>
        </p>
      ))}
    </label>
  );
}

/**
 * Shown when the same document was changed in two places before they synced (BR-STD-04). It cannot
 * be dismissed: no close button, Escape and the backdrop do nothing. The writer must choose, and
 * "Lanjutkan" stays disabled until they do. Differences are marked monochrome (tint + underline).
 */
export function ConflictDialog({ open, local, remote, onResolve }: ConflictDialogProps) {
  const t = useT().studioEditor;
  const [choice, setChoice] = useState<ConflictChoice | null>(null);
  const [busy, setBusy] = useState(false);
  const { onlyA, onlyB } = diffParagraphs(local.paragraphs, remote.paragraphs);
  const same = local.paragraphs.length - onlyA.size;

  async function proceed() {
    if (!choice) return;
    setBusy(true);
    try {
      await onResolve(choice);
    } finally {
      setBusy(false);
      setChoice(null);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      dismissible={false}
      role="alertdialog"
      size="wide"
      fullPageOnMobile
      title={t.conflict.title}
      description={t.conflict.description}
      actions={
        <Button disabled={!choice} loading={busy} onClick={proceed}>
          {t.conflict.continue}
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <VersionCard
          name={t.conflict.thisDevice}
          version={local}
          differing={onlyA}
          checked={choice === "local"}
          picked={choice === "local" || choice === "both"}
          onPick={() => setChoice("local")}
        />
        <VersionCard
          name={t.conflict.elsewhere}
          version={remote}
          differing={onlyB}
          checked={choice === "remote"}
          picked={choice === "remote"}
          onPick={() => setChoice("remote")}
        />
      </div>
      <p className="text-xs text-ink-muted">
        {same > 0 && format(t.conflict.sameParagraphs, { n: String(same) })}
        {t.conflict.differenceNote}
      </p>
      <label className="flex cursor-pointer items-start gap-3 border-t border-line pt-3.5 text-sm">
        <input
          type="radio"
          name="conflict"
          checked={choice === "both"}
          onChange={() => setChoice("both")}
          className={radio}
        />
        <span>
          {t.conflict.both}
          <span className="block text-ink-muted">{t.conflict.bothHint}</span>
        </span>
      </label>
    </Dialog>
  );
}
