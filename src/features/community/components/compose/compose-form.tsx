"use client";

import Link from "next/link";
import { useState, type Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import {
  isActiveDocument,
  isArchivedDocument,
  RESTORE_ARCHIVED_MESSAGE,
} from "@/features/studio/document-archive";
import { studioStore } from "@/features/studio/storage/store";
import {
  canSaveDraft,
  layoutOf,
  missingHint,
  publicBlocks,
  type ComposeAction,
  type ComposeState,
} from "../../compose-state";
import { blocksFromDocument } from "../../doc-blocks";
import type { SourceParam } from "../../hooks/use-source-param";
import { wordsOf } from "../../post-model";
import type { StoredPost } from "../../storage/post-store";
import { DirectEditor } from "./direct-editor";
import { PreviewPanel } from "./preview-panel";
import { SettingsPanel } from "./settings-panel";
import { BlockChoices, DocumentChoices } from "./source-picker";
import { WordCounter } from "./word-counter";

type Props = {
  state: ComposeState;
  dispatch: Dispatch<ComposeAction>;
  drafts: StoredPost[];
  failed: "publish" | "draft" | "group" | null;
  sourceGone: boolean;
  /** What became of the document named in the address, if any. */
  sourceParam: SourceParam;
  busy: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
};

const SOURCE_PARAM_NOTICE: Partial<Record<SourceParam, string>> = {
  archived: RESTORE_ARCHIVED_MESSAGE,
  gone: "Dokumen yang ingin kamu bagikan tidak ditemukan atau sudah ada di Sampah. Pilih dokumen lain di bawah.",
  empty: "Dokumen itu belum ada isinya. Tulis dulu di Studio, atau pilih dokumen lain di bawah.",
  error: "Dokumen itu gagal dibuka. Pilih dari daftar di bawah.",
};

function Notices({ state, failed, sourceGone, sourceParam, onPublish }: Props) {
  return (
    <div className="mt-6 grid gap-4 empty:hidden">
      {failed === "publish" && (
        <ErrorBanner
          action={
            <Button variant="secondary" size="sm" className="-my-1" onClick={onPublish}>
              Terbitkan lagi
            </Button>
          }
        >
          Postingan belum terbit karena koneksi terputus saat mengirim. Teks dan pengaturanmu tetap
          di sini.
        </ErrorBanner>
      )}
      {failed === "group" && state.visibility === "grup" && (
        <ErrorBanner>
          Grup yang dipilih sudah tidak tersedia. Pilih audiens lain untuk menerbitkan.
        </ErrorBanner>
      )}
      {SOURCE_PARAM_NOTICE[sourceParam] && state.pick === null && (
        <Notice>{SOURCE_PARAM_NOTICE[sourceParam]}</Notice>
      )}
      {sourceGone && state.draftSource && (
        <Notice>
          Dokumen sumbernya, “{state.draftSource.title}”, sudah dipindahkan ke Sampah. Draf
          postingan ini tidak berubah: teksnya sudah disalin saat kamu memilihnya.
        </Notice>
      )}
    </div>
  );
}

function DraftLinks({ drafts }: { drafts: StoredPost[] }) {
  if (drafts.length === 0) return null;
  return (
    <p className="mt-4 text-sm text-ink-muted">
      Draf postingan:{" "}
      {drafts.slice(0, 3).map((d, i) => (
        <span key={d.id}>
          {i > 0 && ", "}
          <Link href={`${NEW_POST_HREF}/${d.id}`} className="text-ink underline underline-offset-3">
            {d.title || "Tanpa judul"}
          </Link>
        </span>
      ))}
    </p>
  );
}

function PhoneFooter(p: {
  words: number;
  blocksOnly: boolean;
  draftDisabled: boolean;
  onReview: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center gap-3 border-t border-line bg-canvas px-4 pb-[env(safe-area-inset-bottom)] md:hidden">
      <WordCounter words={p.words} compact className="min-w-0 flex-1" />
      {p.blocksOnly ? (
        <Button variant="secondary" size="sm" onClick={p.onReview}>
          Pratinjau
        </Button>
      ) : (
        <Button
          variant="text"
          disabled={p.draftDisabled}
          onClick={p.onSaveDraft}
          className="text-ink!"
        >
          Simpan draf
        </Button>
      )}
    </div>
  );
}

/** Everything under the bar: tabs, notices, the text column, and the settings column. */
export function ComposeForm(props: Props) {
  const { state, dispatch } = props;
  const docs = useDocumentList(studioStore);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [pickError, setPickError] = useState("");

  const blocks = publicBlocks(state);
  const words = wordsOf(blocks);
  const { fromDoc, picking, review, blocksOnly, sourceTitle } = layoutOf(state);
  const usable = docs.docs.filter((d) => isActiveDocument(d) && d.wordCount > 0);

  async function choose() {
    if (!selectedDoc) return;
    setPickError("");
    try {
      const doc = await studioStore.get(selectedDoc);
      if (doc && isArchivedDocument(doc)) return setPickError(RESTORE_ARCHIVED_MESSAGE);
      if (!doc || !isActiveDocument(doc) || doc.wordCount <= 0) {
        return setPickError("Dokumen ini tidak bisa dipilih. Pilih dokumen lain.");
      }
      dispatch({
        type: "pick",
        pick: {
          docId: doc.id,
          docTitle: doc.title.trim() || "Tanpa judul",
          blocks: blocksFromDocument(doc.content),
          chosen: [],
        },
      });
    } catch {
      setPickError("Dokumen gagal dibaca. Coba lagi.");
    }
  }

  return (
    <>
      <main className="px-4 pt-2 pb-28 md:px-12 md:pb-16">
        <div className="mx-auto max-w-266">
          <Tabs
            label="Cara menulis postingan"
            value={state.tab}
            onValueChange={(id) => dispatch({ type: "tab", tab: id as "direct" | "doc" })}
            items={[
              { id: "direct", label: "Tulis langsung" },
              { id: "doc", label: "Dari dokumen Studio" },
            ]}
            className={review ? "max-md:hidden" : undefined}
          />
          {!state.draftId && <DraftLinks drafts={props.drafts} />}
          <Notices {...props} />

          <div
            className={
              picking
                ? "mt-6 max-w-170"
                : "mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1fr)_23.75rem] md:items-start md:gap-12"
            }
          >
            {state.tab === "direct" && (
              <DirectEditor
                key={state.draftId ?? "new"}
                title={state.title}
                initialBlocks={state.directBlocks}
                onTitleChange={(value) => dispatch({ type: "title", value })}
                onBlocksChange={(next) => dispatch({ type: "direct", blocks: next })}
              />
            )}
            {picking && (
              <DocumentChoices
                status={docs.status}
                docs={usable}
                now={docs.loadedAt}
                selectedId={usable.some((doc) => doc.id === selectedDoc) ? selectedDoc : null}
                error={pickError}
                onSelect={(id) => {
                  setPickError("");
                  setSelectedDoc(id);
                }}
                onRetry={docs.reload}
                onWriteDirect={() => dispatch({ type: "tab", tab: "direct" })}
                onChoose={choose}
              />
            )}
            {state.pick && fromDoc && (
              <div className={review ? "max-md:hidden" : undefined}>
                <BlockChoices
                  docTitle={state.pick.docTitle}
                  blocks={state.pick.blocks}
                  chosen={state.pick.chosen}
                  onToggle={(index) => dispatch({ type: "toggle", index })}
                  onChangeDoc={() => dispatch({ type: "unpick" })}
                />
              </div>
            )}
            {!picking && (
              <aside
                aria-label="Pengaturan postingan"
                className={`grid content-start gap-8 ${blocksOnly ? "max-md:hidden" : ""}`}
              >
                <SettingsPanel
                  state={state}
                  dispatch={dispatch}
                  showTitle={fromDoc}
                  hint={missingHint(state)}
                />
                <WordCounter words={words} className="max-md:hidden" />
                <PreviewPanel
                  title={state.title}
                  kind={state.kind}
                  genre={state.genre}
                  blocks={blocks}
                  image={state.image}
                  sourceTitle={sourceTitle}
                  groupOnly={state.visibility === "grup"}
                />
              </aside>
            )}
          </div>
        </div>
      </main>

      {!picking && (
        <PhoneFooter
          words={words}
          blocksOnly={blocksOnly}
          draftDisabled={!canSaveDraft(state) || props.busy}
          onReview={() => dispatch({ type: "review", on: true })}
          onSaveDraft={props.onSaveDraft}
        />
      )}
    </>
  );
}
