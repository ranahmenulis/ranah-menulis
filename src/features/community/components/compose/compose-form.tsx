"use client";

import Link from "next/link";
import { useState, type Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { cardClass } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import { isActiveDocument, isArchivedDocument } from "@/features/studio/document-archive";
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

/** The writing card: the paper of the post, like the sheet in the Studio editor. */
const writeCard = "rounded-2xl border border-line bg-surface p-5 shadow-card md:px-10 md:py-9";

/** The direct editor card fills the screen height, so it never ends halfway down the page. */
const directCard = cn(
  writeCard,
  "flex flex-col md:min-h-[calc(100dvh-3.5rem-var(--safe-top)-7.5rem)]",
);

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

function paramNotice(param: SourceParam, t: Dictionary["compose"]["form"]): string | undefined {
  if (param === "archived") return t.archived;
  if (param === "gone") return t.paramGone;
  if (param === "empty") return t.paramEmpty;
  if (param === "error") return t.paramError;
  return undefined;
}

function Notices({ state, failed, sourceGone, sourceParam, onPublish }: Props) {
  const t = useT().compose.form;
  const notice = paramNotice(sourceParam, t);
  return (
    <div className="mt-6 grid gap-4 empty:hidden">
      {failed === "publish" && (
        <ErrorBanner
          action={
            <Button variant="secondary" size="sm" className="-my-1" onClick={onPublish}>
              {t.publishAgain}
            </Button>
          }
        >
          {t.publishFailed}
        </ErrorBanner>
      )}
      {failed === "group" && state.visibility === "grup" && (
        <ErrorBanner>{t.groupGone}</ErrorBanner>
      )}
      {notice && state.pick === null && <Notice>{notice}</Notice>}
      {sourceGone && state.draftSource && (
        <Notice>{format(t.sourceTrashed, { title: state.draftSource.title })}</Notice>
      )}
    </div>
  );
}

function DraftLinks({ drafts }: { drafts: StoredPost[] }) {
  const t = useT().compose.form;
  if (drafts.length === 0) return null;
  return (
    <p className="mt-4 text-sm text-ink-muted">
      {t.draftLinks}{" "}
      {drafts.slice(0, 3).map((d, i) => (
        <span key={d.id}>
          {i > 0 && ", "}
          <Link href={`${NEW_POST_HREF}/${d.id}`} className="text-ink underline underline-offset-3">
            {d.title || t.untitled}
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
  const t = useT().compose.form;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center gap-3 border-t border-line bg-surface px-4 pb-[env(safe-area-inset-bottom)] md:hidden">
      <WordCounter words={p.words} compact className="min-w-0 flex-1" />
      {p.blocksOnly ? (
        <Button variant="secondary" size="sm" onClick={p.onReview}>
          {t.preview}
        </Button>
      ) : (
        <Button
          variant="text"
          disabled={p.draftDisabled}
          onClick={p.onSaveDraft}
          className="text-ink!"
        >
          {t.saveDraftShort}
        </Button>
      )}
    </div>
  );
}

/** Everything under the bar: tabs, notices, the text column, and the settings column. */
export function ComposeForm(props: Props) {
  const { state, dispatch } = props;
  const t = useT().compose.form;
  const locale = useLocale();
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
      if (doc && isArchivedDocument(doc)) return setPickError(t.archived);
      if (!doc || !isActiveDocument(doc) || doc.wordCount <= 0) {
        return setPickError(t.pickUnavailable);
      }
      dispatch({
        type: "pick",
        pick: {
          docId: doc.id,
          docTitle: doc.title.trim() || t.untitled,
          blocks: blocksFromDocument(doc.content),
          chosen: [],
        },
      });
    } catch {
      setPickError(t.pickFailed);
    }
  }

  return (
    <>
      <main className="px-4 pt-4 pb-28 md:px-12 md:pt-6 md:pb-16">
        <div className="mx-auto max-w-266">
          <Tabs
            label={t.tabsLabel}
            value={state.tab}
            onValueChange={(id) => dispatch({ type: "tab", tab: id as "direct" | "doc" })}
            items={[
              { id: "direct", label: t.tabDirect },
              { id: "doc", label: t.tabDoc },
            ]}
            variant="pill"
            className={review ? "max-md:hidden" : undefined}
          />
          {!state.draftId && <DraftLinks drafts={props.drafts} />}
          <Notices {...props} />

          <div
            className={
              picking
                ? "mt-6 max-w-170"
                : "mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1fr)_24rem] md:items-start md:gap-8"
            }
          >
            {state.tab === "direct" && (
              <div className={directCard}>
                <DirectEditor
                  key={`${state.draftId ?? "new"}-${locale}`}
                  title={state.title}
                  initialBlocks={state.directBlocks}
                  onTitleChange={(value) => dispatch({ type: "title", value })}
                  onBlocksChange={(next) => dispatch({ type: "direct", blocks: next })}
                />
              </div>
            )}
            {picking && (
              <div className={writeCard}>
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
              </div>
            )}
            {state.pick && fromDoc && (
              <div className={cn(writeCard, review && "max-md:hidden")}>
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
                aria-label={t.settingsLabel}
                className={`grid content-start gap-8 ${blocksOnly ? "max-md:hidden" : ""}`}
              >
                <div className={cn(cardClass, "grid gap-8")}>
                  <SettingsPanel
                    state={state}
                    dispatch={dispatch}
                    showTitle={fromDoc}
                    hint={missingHint(state, t, locale)}
                  />
                  <WordCounter words={words} className="max-md:hidden" />
                </div>
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
