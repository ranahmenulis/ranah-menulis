"use client";

import { useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import {
  EmptyState,
  ErrorBanner,
  FeedItemSkeleton,
  Notice,
  RetryButton,
} from "@/components/ui/states";
import { personById } from "@/features/kelola/admin/people";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import type { GroupResult } from "../group-actions";
import { shareProgress } from "../group-content-actions";
import { memberOf, type WritingGroup } from "../group-model";

const number = new Intl.NumberFormat("id-ID");

function ProgressDialog({
  groupId,
  reader,
  store,
  onClose,
  onShared,
}: {
  groupId: string;
  reader: string;
  store: DocumentStore;
  onClose: () => void;
  onShared: (result: GroupResult) => void;
}) {
  const docs = useDocumentList(store);
  const usable = docs.docs.filter((doc) => !doc.deletedAt && doc.wordCount > 0);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const documentId = useId();
  const doc = usable.find((item) => item.id === selected);

  async function confirm() {
    if (!doc || busy) return;
    setBusy(true);
    const result = await shareProgress(groupId, doc, store);
    setBusy(false);
    if (result.ok) onShared(result);
    else {
      setFailure(result.message);
      setSelected("");
      docs.reload();
    }
  }

  return (
    <Dialog
      open
      title="Bagikan progres"
      onClose={busy ? () => {} : onClose}
      actions={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Batal
          </Button>
          {docs.status === "ready" && usable.length > 0 && (
            <Button disabled={!doc} loading={busy} onClick={() => void confirm()}>
              Bagikan
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-4">
        <Notice>
          Anggota grup akan melihat nama pengguna, judul dokumen, dan jumlah kata saat ini. Dokumen
          dan isinya tetap pribadi.
        </Notice>
        {failure && <ErrorBanner>{failure}</ErrorBanner>}
        {docs.status === "loading" && <FeedItemSkeleton />}
        {docs.status === "error" && (
          <ErrorBanner action={<RetryButton onClick={docs.reload} />}>
            Daftar dokumen gagal dimuat.
          </ErrorBanner>
        )}
        {docs.status === "ready" &&
          (usable.length > 0 ? (
            <Field id={documentId} label="Dokumen Studio">
              <Select
                id={documentId}
                value={selected}
                disabled={busy}
                onChange={(event) => {
                  setSelected(event.target.value);
                  setFailure("");
                }}
              >
                <option value="" disabled>
                  Pilih dokumen
                </option>
                {usable.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title || "Tanpa judul"}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <EmptyState
              action={
                <ButtonLink href="/studio" variant="secondary" onClick={onClose}>
                  Buka Studio
                </ButtonLink>
              }
            >
              Belum ada dokumen yang berisi tulisan.
            </EmptyState>
          ))}
        {docs.status === "ready" && doc && (
          <p className="border-t border-line pt-3 text-sm wrap-anywhere">
            @{personById(reader)?.handle} · {doc.title || "Tanpa judul"} ·{" "}
            {number.format(doc.wordCount)} kata
          </p>
        )}
      </div>
    </Dialog>
  );
}

export function GroupProgressSection({
  group,
  reader,
  store = studioStore,
  onResult,
}: {
  group: WritingGroup;
  reader: string;
  store?: DocumentStore;
  onResult: (result: GroupResult) => void;
}) {
  const [open, setOpen] = useState(false);
  const progress = group.progress.filter(
    (item) => memberOf(group, item.authorId)?.membershipId === item.membershipId,
  );
  return (
    <section className="grid gap-3 border-t border-line pt-5" aria-labelledby="group-progress">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="group-progress" className="heading-md">
          Progres
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Bagikan progres
        </Button>
      </div>
      {progress.length ? (
        <ul className="divide-y divide-line">
          {progress.map((item) => (
            <li key={item.id} className="grid gap-1 py-3 text-sm wrap-anywhere">
              <p>{item.title || "Tanpa judul"}</p>
              <p className="text-ink-muted">
                @{item.username} · {number.format(item.words)} kata
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Belum ada progres yang dibagikan.</p>
      )}
      {open && (
        <ProgressDialog
          groupId={group.id}
          reader={reader}
          store={store}
          onClose={() => setOpen(false)}
          onShared={(result) => {
            setOpen(false);
            onResult(result);
          }}
        />
      )}
    </section>
  );
}
