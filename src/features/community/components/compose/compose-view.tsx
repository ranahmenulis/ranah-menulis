"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { DISCOVER_HREF } from "@/features/app-shell/nav";
import { canPublish, canSaveDraft, layoutOf } from "../../compose-state";
import { useCommunity } from "../../hooks/use-community";
import { useCompose } from "../../hooks/use-compose";
import { postStore } from "../../storage/store";
import { ComposeBar } from "./compose-bar";
import { ComposeForm } from "./compose-form";
import { ComposeLoading, ComposeMissing } from "./compose-states";
import { PublishDone } from "./publish-done";

/**
 * Write a post (COM-01, STD-10): two ways in, a mandatory notice that only this text becomes
 * public, no default visibility, and a 500-word limit that never cuts text. Dummy and local: posts
 * and drafts are kept on this device.
 */
export function ComposeView({
  draftId,
  sourceDocId = null,
}: {
  draftId: string | null;
  /** Studio document chosen before arriving (`?dokumen=`); ignored when reopening a draft. */
  sourceDocId?: string | null;
}) {
  const c = useCompose(postStore, draftId, sourceDocId);
  const { state, dispatch } = c;
  const router = useRouter();
  const toast = useToast();
  const community = useCommunity(postStore);
  const [leaving, setLeaving] = useState(false);

  const { picking, review } = layoutOf(state);

  const leave = () => (window.history.length > 1 ? router.back() : router.push(DISCOVER_HREF));

  async function saveDraft() {
    if (await c.saveDraft()) toast({ message: "Draf disimpan di perangkat ini.", key: "draft" });
    else toast({ message: "Draf belum tersimpan. Coba lagi.", tone: "error", key: "draft" });
  }

  if (c.load === "loading" || c.sourceParam === "loading") return <ComposeLoading />;
  if (c.load !== "ready") return <ComposeMissing failed={c.load === "error"} />;

  const bar = (
    <ComposeBar
      name={c.done ? "Postingan terbit" : state.draftId ? "Draf postingan" : "Postingan baru"}
      isDraft={state.draftId !== null && !c.done}
      actions={!c.done}
      backToText={review}
      draftDisabled={!canSaveDraft(state) || c.busy}
      publishDisabled={!canPublish(state) || picking}
      publishing={c.busy && !c.failed}
      onClose={() => (c.dirty ? setLeaving(true) : leave())}
      onBackToText={() => dispatch({ type: "review", on: false })}
      onDraft={() => void saveDraft()}
      onPublish={() => void c.publish()}
    />
  );

  if (c.done) {
    return (
      <>
        {bar}
        <main className="px-4 md:px-12">
          <PublishDone post={c.done} />
        </main>
      </>
    );
  }

  return (
    <>
      {bar}
      <ComposeForm
        state={state}
        dispatch={dispatch}
        drafts={community.drafts.filter((d) => d.id !== state.draftId)}
        failed={c.failed}
        sourceGone={c.sourceGone}
        sourceParam={c.sourceParam}
        busy={c.busy}
        onPublish={() => void c.publish()}
        onSaveDraft={() => void saveDraft()}
      />
      <Dialog
        open={leaving}
        onClose={() => setLeaving(false)}
        title="Tutup tanpa menerbitkan?"
        description="Postingan ini belum diterbitkan dan perubahannya belum disimpan sebagai draf."
        actions={
          <>
            <Button variant="danger-text" onClick={leave}>
              Buang
            </Button>
            <Button
              onClick={() =>
                void c.saveDraft().then((ok) => {
                  if (ok) leave();
                  else setLeaving(false);
                })
              }
            >
              Simpan sebagai draf
            </Button>
          </>
        }
      />
    </>
  );
}
