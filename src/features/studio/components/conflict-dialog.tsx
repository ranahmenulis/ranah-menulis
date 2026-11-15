"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { formatClock } from "../count-words";
import { diffParagraphs } from "../diff-paragraphs";
import type { ConflictChoice } from "../hooks/use-studio-document";

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
            {formatClock(version.savedAt)} · {version.words} kata
          </span>
        </span>
      </span>
      {shown.length === 0 && (
        <span className="text-xs text-ink-muted">Hanya judul yang berbeda.</span>
      )}
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
      title="Dokumen ini diubah di dua tempat"
      description="Dokumen yang sama diubah dari perangkat atau tab lain sebelum perubahan ini tersimpan. Pilih versi yang dipakai. Tidak ada yang ditimpa sebelum kamu memilih."
      actions={
        <Button disabled={!choice} loading={busy} onClick={proceed}>
          Lanjutkan
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <VersionCard
          name="Perangkat ini"
          version={local}
          differing={onlyA}
          checked={choice === "local"}
          picked={choice === "local" || choice === "both"}
          onPick={() => setChoice("local")}
        />
        <VersionCard
          name="Dari tempat lain"
          version={remote}
          differing={onlyB}
          checked={choice === "remote"}
          picked={choice === "remote"}
          onPick={() => setChoice("remote")}
        />
      </div>
      <p className="text-xs text-ink-muted">
        {same > 0 && `${same} paragraf sama di kedua versi. `}Bagian yang berbeda bergaris bawah.
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
          Simpan keduanya
          <span className="block text-ink-muted">
            Dokumen ini memakai versi perangkat ini. Versi dari tempat lain disimpan sebagai dokumen
            baru.
          </span>
        </span>
      </label>
    </Dialog>
  );
}
