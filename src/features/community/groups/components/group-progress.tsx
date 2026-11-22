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
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import { isActiveDocument } from "@/features/studio/document-archive";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import type { GroupResult } from "../group-actions";
import { groupMessage } from "../group-messages";
import { shareProgress } from "../group-content-actions";
import { memberOf, type WritingGroup } from "../group-model";

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
  const dict = useT();
  const t = dict.groups.progress;
  const { number, locale } = useFormat();
  const docs = useDocumentList(store);
  const usable = docs.docs.filter((doc) => isActiveDocument(doc) && doc.wordCount > 0);
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
      setFailure(groupMessage(result.code, dict.groups.messages, locale));
      setSelected("");
      docs.reload();
    }
  }

  return (
    <Dialog
      open
      title={t.dialogTitle}
      onClose={busy ? () => {} : onClose}
      actions={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            {t.cancel}
          </Button>
          {docs.status === "ready" && usable.length > 0 && (
            <Button disabled={!doc} loading={busy} onClick={() => void confirm()}>
              {t.confirm}
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-4">
        <Notice>{t.notice}</Notice>
        {failure && <ErrorBanner>{failure}</ErrorBanner>}
        {docs.status === "loading" && <FeedItemSkeleton />}
        {docs.status === "error" && (
          <ErrorBanner action={<RetryButton onClick={docs.reload} />}>{t.loadError}</ErrorBanner>
        )}
        {docs.status === "ready" &&
          (usable.length > 0 ? (
            <Field id={documentId} label={t.docLabel}>
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
                  {t.choose}
                </option>
                {usable.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title || t.untitled}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <EmptyState
              action={
                <ButtonLink href="/studio" variant="secondary" onClick={onClose}>
                  {t.openStudio}
                </ButtonLink>
              }
            >
              {t.noDocs}
            </EmptyState>
          ))}
        {docs.status === "ready" && doc && (
          <p className="border-t border-line pt-3 text-sm wrap-anywhere">
            {format(t.meta, {
              username: personById(reader)?.handle ?? "",
              title: doc.title || t.untitled,
              words: number(doc.wordCount),
            })}
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
  const t = useT().groups.progress;
  const { number } = useFormat();
  const [open, setOpen] = useState(false);
  const progress = group.progress.filter(
    (item) => memberOf(group, item.authorId)?.membershipId === item.membershipId,
  );
  return (
    <section className="grid gap-3 border-t border-line pt-5" aria-labelledby="group-progress">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="group-progress" className="heading-md">
          {t.title}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          {t.share}
        </Button>
      </div>
      {progress.length ? (
        <ul className="divide-y divide-line">
          {progress.map((item) => (
            <li key={item.id} className="grid gap-1 py-3 text-sm wrap-anywhere">
              <p>{item.title || t.untitled}</p>
              <p className="text-ink-muted">
                {format(t.item, { username: item.username, words: number(item.words) })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">{t.empty}</p>
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
