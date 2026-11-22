"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner, FeedItemSkeleton, Notice, RetryButton } from "@/components/ui/states";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { ARCHIVE_HREF, isArchivedDocument } from "@/features/studio/document-archive";
import { onDocumentListChanged } from "@/features/studio/storage/document-events";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { beginEventSprint, leaveEvent } from "../event-actions";
import { eventMessage } from "../event-messages";
import { eventStudioHref, type EventEntry, type WritingEvent } from "../event-model";

type DocumentState = "loading" | "ready" | "missing" | "archived" | "error";

function DocumentNotice({ state, retry }: { state: DocumentState; retry: () => void }) {
  const t = useT().events.participation;
  if (state === "loading") return <FeedItemSkeleton />;
  if (state === "error")
    return <ErrorBanner action={<RetryButton onClick={retry} />}>{t.docLoadError}</ErrorBanner>;
  if (state === "missing") return <Notice>{t.docMissing}</Notice>;
  if (state === "archived")
    return (
      <Notice>
        {t.docArchived}{" "}
        <Link href={ARCHIVE_HREF} className="underline">
          {t.openArchive}
        </Link>
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
  const dict = useT().events;
  const t = dict.participation;
  const { number } = useFormat();
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
    let latest = 0;
    function check() {
      const request = ++latest;
      void store.get(documentId).then(
        (doc) => {
          if (!live || request !== latest) return;
          if (!doc || doc.deletedAt != null) setDocState("missing");
          else setDocState(isArchivedDocument(doc) ? "archived" : "ready");
        },
        () => {
          if (live && request === latest) setDocState("error");
        },
      );
    }
    const unsubscribe = onDocumentListChanged(check);
    check();
    window.addEventListener("focus", check);
    return () => {
      live = false;
      unsubscribe();
      window.removeEventListener("focus", check);
    };
  }, [documentId, store, attempt]);

  async function sprint() {
    if (pending || confirm) return;
    setPending("sprint");
    setError("");
    const result = await beginEventSprint(event.id, entry.id, store);
    setPending(null);
    if (result.ok) router.push(href);
    else setError(eventMessage(result, dict.messages, dict.status));
  }

  async function leave() {
    if (pending) return;
    setPending("leave");
    setError("");
    const result = await leaveEvent(event.id, entry.id);
    setPending(null);
    if (result.ok) {
      setConfirm(false);
      show(eventMessage(result, dict.messages, dict.status));
    } else setError(eventMessage(result, dict.messages, dict.status));
  }

  return (
    <section className="grid gap-3 border-t border-line pt-6">
      <h2 className="heading-md">{t.title}</h2>
      <p className="tabular-nums">
        {format(t.progress, { words: number(entry.words), target: number(event.target) })}
      </p>
      <progress
        className="h-1 w-full accent-ink"
        aria-label={t.progressLabel}
        value={Math.min(entry.words, event.target)}
        max={event.target}
      />
      {event.sprint && now >= event.sprint.endsAt && entry.sprint && (
        <p className="text-sm text-ink-muted">
          {format(t.sprintResult, { words: number(entry.sprint.words) })}
        </p>
      )}
      {active && <DocumentNotice state={docState} retry={() => setAttempt((value) => value + 1)} />}
      {error && !confirm && <ErrorBanner>{error}</ErrorBanner>}
      <div className="flex flex-wrap items-center gap-2">
        {active &&
          docState === "ready" &&
          (sprintOpen ? (
            <Button disabled={pending !== null} onClick={() => void sprint()}>
              {entry.sprint ? t.continueSprint : t.joinSprint}
            </Button>
          ) : (
            <ButtonLink href={href}>{t.continueWriting}</ButtonLink>
          ))}
        <Button
          variant="text"
          disabled={pending !== null}
          onClick={() => {
            setError("");
            setConfirm(true);
          }}
        >
          {t.leave}
        </Button>
      </div>
      {confirm && (
        <Dialog
          open
          onClose={() => setConfirm(false)}
          role="alertdialog"
          dismissible={pending !== "leave"}
          title={t.leaveTitle}
          description={t.leaveBody}
          actions={
            <>
              <Button
                variant="secondary"
                disabled={pending !== null}
                onClick={() => setConfirm(false)}
              >
                {t.cancel}
              </Button>
              <Button variant="danger" disabled={pending !== null} onClick={() => void leave()}>
                {t.leaveConfirm}
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
