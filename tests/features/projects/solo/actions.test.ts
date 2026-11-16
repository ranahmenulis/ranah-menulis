import { describe, expect, it } from "vitest";
import {
  addPreviewFile,
  advanceStage,
  approveFinal,
  requestChanges,
} from "@/features/projects/solo/solo-actions";
import { createMemorySoloStore } from "@/features/projects/solo/storage/memory-solo-store";
import { onSoloChanged } from "@/features/projects/solo/storage/solo-events";
import { currentStage } from "@/features/projects/solo/stage-model";
import { FULL, ID, SOLO } from "./helpers";

const target = { id: ID, slug: SOLO, stages: FULL };

async function row(store: ReturnType<typeof createMemorySoloStore>) {
  return (await store.list()).find((r) => r.id === ID) ?? null;
}

describe("solo actions", () => {
  it("creates the row on the first step and tells the screens", async () => {
    const store = createMemorySoloStore();
    let told = 0;
    const stop = onSoloChanged(() => told++);
    expect(await advanceStage(store, target)).toBe("ok");
    stop();
    expect(told).toBe(1);
    expect(currentStage(FULL, await row(store))).toBe("proofreading");
  });

  it("walks to the final approval, then changes and approval follow the rules", async () => {
    const store = createMemorySoloStore();
    expect(await approveFinal(store, target)).toBe("rejected");
    for (let i = 0; i < 4; i++) expect(await advanceStage(store, target)).toBe("ok");
    expect(currentStage(FULL, await row(store))).toBe("persetujuan-final");
    expect(await advanceStage(store, target)).toBe("rejected");
    // Nothing to look at yet: neither decision is possible.
    expect(await approveFinal(store, target)).toBe("rejected");
    await addPreviewFile(store, target, "cover");
    await addPreviewFile(store, target, "layout");
    expect(await requestChanges(store, target, " ")).toBe("rejected");
    expect(await requestChanges(store, target, "Ganti sampul")).toBe("ok");
    expect(currentStage(FULL, await row(store))).toBe("layout");
    await advanceStage(store, target);
    expect(await approveFinal(store, target)).toBe("ok");
    expect(currentStage(FULL, await row(store))).toBe("produksi");
    // Once production started, the decision is final.
    expect(await approveFinal(store, target)).toBe("rejected");
  });

  it("adds preview files and keeps them", async () => {
    const store = createMemorySoloStore();
    await addPreviewFile(store, target, "cover");
    await addPreviewFile(store, target, "cover");
    expect((await row(store))?.files).toHaveLength(2);
  });

  it("reports a store that fails instead of throwing", async () => {
    const store = createMemorySoloStore();
    store.add = () => Promise.reject(new Error("no"));
    expect(await advanceStage(store, target)).toBe("failed");
  });
});
