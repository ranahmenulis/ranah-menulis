"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioChoice } from "@/components/ui/choice";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner, Notice, RetryButton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { useSendTargets, type SendTargets } from "@/features/projects/hooks/use-send-targets";
import { categoryLabel } from "@/features/projects/project-model";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";

type Props = {
  open: boolean;
  onClose: () => void;
  /** The document being sent; `null` while it is a new document that is not stored yet. */
  docId: string | null;
  /**
   * Opens the send page for the chosen project. Resolves false when that could not be done (the
   * text could not be stored first), so nothing is sent away unsaved.
   */
  onPick: (slug: string) => Promise<boolean>;
  /** Replaces the device's submission store in tests. */
  store?: SubmissionStore;
};

function Targets({
  status,
  targets,
  reload,
  value,
  onChange,
  onLeave,
}: SendTargets & {
  value: string | null;
  onChange: (slug: string) => void;
  onLeave: () => void;
}) {
  if (status === "error") {
    return (
      <ErrorBanner action={<RetryButton onClick={reload} />}>
        Daftar proyekmu belum bisa dibaca dari perangkat ini.
      </ErrorBanner>
    );
  }
  if (status === "loading") return <p className="text-sm text-ink-muted">Memuat proyekmu…</p>;
  if (targets.length === 0) {
    return (
      <Notice
        action={
          <TextLink href={PROJECTS_HREF} onClick={onLeave} className="text-sm whitespace-nowrap">
            Lihat Projects
          </TextLink>
        }
      >
        Kamu belum terdaftar di proyek yang menerima karya.
      </Notice>
    );
  }
  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Pilih proyek</legend>
      {targets.map(({ project, reason }) => (
        <RadioChoice
          key={project.slug}
          name="proyek"
          value={project.slug}
          checked={value === project.slug}
          disabled={reason !== null}
          onChange={() => onChange(project.slug)}
          label={<span className="wrap-anywhere">{project.title}</span>}
          hint={reason ?? categoryLabel(project.category)}
        />
      ))}
    </fieldset>
  );
}

/**
 * "Kirim ke proyek" (STD-09). It sends nothing itself: it picks a project you are registered for and
 * hands over to the send page, where the information is filled in, the rules are checked, and the
 * frozen copy is made. Closing it before leaving matters: a modal left open would freeze the page.
 */
export function SendToProjectDialog({ open, onClose, docId, onPick, store }: Props) {
  const found = useSendTargets(docId, store);
  const [slug, setSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // A choice that stopped being possible (another tab sent a work meanwhile) is not a choice.
  const chosen = found.targets.some((t) => t.project.slug === slug && t.reason === null)
    ? slug
    : null;

  function close() {
    if (busy) return;
    setSlug(null);
    setFailed(false);
    onClose();
  }

  async function next() {
    if (!chosen) return;
    setBusy(true);
    setFailed(false);
    const ok = await onPick(chosen).catch(() => false);
    // The screen stays mounted in the background after the page changes; busy must not outlive this.
    setBusy(false);
    if (ok) setSlug(null);
    else setFailed(true);
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      dismissible={!busy}
      swipeToDismiss
      title="Kirim ke proyek"
      description="Pilih proyek yang kamu ikuti. Informasi karya dan pemeriksaannya ada di langkah berikutnya."
      actions={
        <>
          <Button variant="text" onClick={close} disabled={busy}>
            Batal
          </Button>
          <Button onClick={() => void next()} disabled={!chosen} loading={busy}>
            Lanjutkan
          </Button>
        </>
      }
    >
      <Targets {...found} value={chosen} onChange={setSlug} onLeave={close} />
      {failed && (
        <ErrorBanner>
          Tulisanmu belum tersimpan di perangkat ini, jadi belum bisa dikirim. Coba lagi sebentar
          lagi.
        </ErrorBanner>
      )}
    </Dialog>
  );
}
