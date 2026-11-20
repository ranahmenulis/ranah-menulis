import { withAdvance, withApproval, withChangeRequest, withFile } from "./stage-model";
import { notifySoloChanged } from "./storage/solo-events";
import type { SoloStore } from "./storage/solo-store";
import type { PreviewFile, SoloProgress, SoloStage } from "./types";

/** `rejected`: the rules no longer allow it (another tab got there first). */
export type ActionResult = "ok" | "rejected" | "missing" | "failed";

type Target = { id: string; slug: string; stages: SoloStage[] };

/**
 * Writes one step. A book with no row yet gets an empty one first (the first stage runs without
 * one), then the change is applied inside the store's transaction. The clock is read here, when
 * the button is pressed.
 */
async function run(
  store: SoloStore,
  t: Target,
  step: (current: SoloProgress | null) => SoloProgress | null,
): Promise<ActionResult> {
  try {
    await store.add({ id: t.id, slug: t.slug, log: [], files: [] });
    const verdict = await store.update(t.id, step);
    if (verdict === "ok") notifySoloChanged();
    return verdict;
  } catch {
    return "failed";
  }
}

const base = (t: Target) => ({ id: t.id, slug: t.slug });

/** The author approves the final proof. Production starts and this cannot be undone (Q-24). */
export const approveFinal = (store: SoloStore, t: Target) =>
  run(store, t, (cur) => withApproval(t.stages, cur, base(t), Date.now()));

/** The author asks for changes, with a note. The number of rounds is limited. */
export const requestChanges = (store: SoloStore, t: Target, note: string) =>
  run(store, t, (cur) => withChangeRequest(t.stages, cur, base(t), Date.now(), note));

/** The publishing team's step (Organizer, tab Tahap). */
export const advanceStage = (store: SoloStore, t: Target) =>
  run(store, t, (cur) => withAdvance(t.stages, cur, base(t), Date.now()));

/** The publishing team adds a preview file (an image or a PDF kept in the file store). */
export const addPreviewFile = (
  store: SoloStore,
  t: Target,
  kind: PreviewFile["kind"],
  upload?: Parameters<typeof withFile>[4],
) => run(store, t, (cur) => withFile(cur, base(t), kind, Date.now(), upload));
