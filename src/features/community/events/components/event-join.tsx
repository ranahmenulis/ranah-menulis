"use client";

import { useEffect, useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { ErrorBanner, FeedItemSkeleton, Notice, RetryButton } from "@/components/ui/states";
import { STUDIO_HREF } from "@/features/app-shell/nav";
import { isActiveDocument } from "@/features/studio/document-archive";
import { onDocumentListChanged } from "@/features/studio/storage/document-events";
import type { DocumentStore, StudioDocument } from "@/features/studio/storage/document-store";
import { joinEvent } from "../event-actions";

type DocumentOptions =
  { status: "loading" | "error" } | { status: "ready"; documents: StudioDocument[] };

export function EventJoin({
  eventId,
  store,
  close,
  joined,
}: {
  eventId: string;
  store: DocumentStore;
  close: () => void;
  joined: (message: string) => void;
}) {
  const id = useId();
  const [state, setState] = useState<DocumentOptions>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [docId, setDocId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void store.list().then(
      (docs) => {
        if (active) setState({ status: "ready", documents: docs.filter(isActiveDocument) });
      },
      () => {
        if (active) setState({ status: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, [store, attempt]);

  useEffect(() => onDocumentListChanged(() => setAttempt((value) => value + 1)), []);

  async function submit() {
    setPending(true);
    setError("");
    const result = await joinEvent(eventId, docId, store);
    if (result.ok) {
      close();
      joined(result.message);
    } else {
      setError(result.message);
      setPending(false);
    }
  }

  return (
    <Dialog
      open
      onClose={close}
      title="Gabung event"
      description="Pilih dokumen Studio untuk menghitung progresmu. Judul dan isi dokumen tetap pribadi."
      dismissible={!pending}
      actions={
        <>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Batal
          </Button>
          <Button disabled={!docId || pending} onClick={() => void submit()}>
            {pending ? "Mendaftarkan…" : "Gabung"}
          </Button>
        </>
      }
    >
      {state.status === "loading" ? (
        <FeedItemSkeleton />
      ) : state.status === "error" ? (
        <ErrorBanner
          action={
            <RetryButton
              onClick={() => {
                setState({ status: "loading" });
                setAttempt((value) => value + 1);
              }}
            />
          }
        >
          Dokumen Studio belum bisa dibuka.
        </ErrorBanner>
      ) : state.status === "ready" && state.documents.length > 0 ? (
        <Field id={id} label="Dokumen Studio">
          <Select
            id={id}
            value={docId}
            disabled={pending}
            onChange={(e) => setDocId(e.target.value)}
          >
            <option value="">Pilih dokumen</option>
            {state.documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title || "Tanpa judul"}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Notice
          action={
            <ButtonLink variant="secondary" href={STUDIO_HREF} onClick={close}>
              Buka Studio
            </ButtonLink>
          }
        >
          Simpan satu dokumen di Studio untuk mengikuti tantangan ini.
        </Notice>
      )}
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
    </Dialog>
  );
}
