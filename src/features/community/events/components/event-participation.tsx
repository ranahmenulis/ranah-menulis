"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner, FeedItemSkeleton, Notice, RetryButton } from "@/components/ui/states";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { beginEventSprint, leaveEvent } from "../event-actions";
import { eventStudioHref, type EventEntry, type WritingEvent } from "../event-model";

type DocumentState = "loading" | "ready" | "missing" | "error";
const number = new Intl.NumberFormat("id-ID");

function DocumentNotice({ state, retry }: { state: DocumentState; retry: () => void }) {
  if (state === "loading") return <FeedItemSkeleton />;
  if (state === "error")
    return (
      <ErrorBanner action={<RetryButton onClick={retry} />}>
        Dokumen Studio belum bisa dibuka.
      </ErrorBanner>
    );
  if (state === "missing")
    return (
      <Notice>
        Dokumen tantangan tidak tersedia. Pulihkan dokumen yang sama dari Sampah untuk melanjutkan.
      </Notice>
    );
  return null;
}

export function EventParticipation({
  event,
  entry,
  store,
  now,
  show,
}: {
  event: WritingEvent;
  entry: EventEntry;
  store: DocumentStore;
  now: number;
  show: (message: string) => void;
}) {
  const router = useRouter();
  const [docState, setDocState] = useState<DocumentState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState<"sprint" | "leave" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const { documentId } = entry;
  const href = eventStudioHref(event.id, documentId);
  const active = now < event.endsAt;
  const sprintOpen = event.sprint && now >= event.sprint.startsAt && now < event.sprint.endsAt;

  useEffect(() => {
    let live = true;
    function check() {
      void store.get(documentId).then(
        (doc) => {
          if (live) setDocState(doc && doc.deletedAt == null ? "ready" : "missing");
        },
        () => {
          if (live) setDocState("error");
        },
      );
    }
    check();
    window.addEventListener("focus", check);
    return () => {
      live = false;
      window.removeEventListener("focus", check);
    };
  }, [documentId, store, attempt]);

  async function sprint() {
    setPending("sprint");
    setError("");
    const result = await beginEventSprint(event.id, entry.id, store);
    setPending(null);
    if (result.ok) router.push(href);
    else setError(result.message);
  }

  async function leave() {
    setPending("leave");
    setError("");
    const result = await leaveEvent(event.id, entry.id);
    setPending(null);
    if (result.ok) {
      setConfirm(false);
      show(result.message);
    } else setError(result.message);
  }

  return (
    <section className="grid gap-3 border-t border-line pt-6">
      <h2 className="heading-md">Progresmu</h2>
      <p className="tabular-nums">
        {number.format(entry.words)} dari {number.format(event.target)} kata
      </p>
      <progress
        className="h-1 w-full accent-ink"
        aria-label="Progres kata tantangan"
        value={Math.min(entry.words, event.target)}
        max={event.target}
      />
      {event.sprint && now >= event.sprint.endsAt && entry.sprint && (
        <p className="text-sm text-ink-muted">
          Hasil sprintmu · {number.format(entry.sprint.words)} kata
        </p>
      )}
      {active && <DocumentNotice state={docState} retry={() => setAttempt((value) => value + 1)} />}
      {error && !confirm && <ErrorBanner>{error}</ErrorBanner>}
      <div className="flex flex-wrap items-center gap-2">
        {active &&
          docState === "ready" &&
          (sprintOpen ? (
            <Button disabled={pending !== null} onClick={() => void sprint()}>
              {entry.sprint ? "Lanjutkan sprint" : "Ikut sprint"}
            </Button>
          ) : (
            <ButtonLink href={href}>Lanjutkan menulis</ButtonLink>
          ))}
        <Button
          variant="text"
          onClick={() => {
            setError("");
            setConfirm(true);
          }}
        >
          Keluar dari event
        </Button>
      </div>
      {confirm && (
        <Dialog
          open
          onClose={() => setConfirm(false)}
          role="alertdialog"
          dismissible={pending !== "leave"}
          title="Keluar dari event?"
          description="Pendaftaran dan progres event akan dihapus. Dokumenmu tetap tersimpan di Studio."
          actions={
            <>
              <Button
                variant="secondary"
                disabled={pending !== null}
                onClick={() => setConfirm(false)}
              >
                Batal
              </Button>
              <Button variant="danger" disabled={pending !== null} onClick={() => void leave()}>
                Keluar
              </Button>
            </>
          }
        >
          {error && <ErrorBanner>{error}</ErrorBanner>}
        </Dialog>
      )}
    </section>
  );
}
