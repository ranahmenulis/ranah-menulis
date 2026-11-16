import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { onSubmissionsChanged } from "@/features/projects/storage/submission-events";
import { sendRevision } from "@/features/projects/revise-flow";
import { reviewSubmission, withdrawSubmission } from "@/features/projects/submission-actions";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import type { Submission } from "@/features/projects/submission-types";
import { project, submission, textOf } from "./helpers";

const DAY = 86_400_000;
const esai = project("lomba-esai-literasi-remaja", Date.now());

function revising(over: Partial<Submission> = {}): Submission {
  const now = Date.now();
  return submission({
    id: "s1",
    slug: esai.slug,
    status: "perlu-revisi",
    statusLog: [
      { status: "terkirim", at: now - 3 * DAY, by: "sistem" },
      {
        status: "perlu-revisi",
        at: now - DAY,
        by: "editor",
        reason: "Pendekkan.",
        dueAt: now + 6 * DAY,
      },
    ],
    ...over,
  });
}

function docs(words = 900, id = "d1") {
  const doc: StudioDocument = {
    id,
    title: "Esai revisi",
    content: textOf(words),
    wordCount: words,
    version: 1,
    updatedAt: 1,
  };
  return { get: vi.fn(async (wanted: string) => (wanted === doc.id ? doc : null)) };
}

async function setup(work = revising()) {
  const store = createMemorySubmissionStore();
  await store.add(work, 5);
  return store;
}

beforeEach(() => localStorage.clear());

describe("sendRevision", () => {
  it("adds a frozen version 2 and keeps version 1", async () => {
    const store = await setup();
    const out = await sendRevision({
      project: esai,
      submission: revising(),
      docId: "d1",
      note: "Sudah dipendekkan.",
      documents: docs(900),
      store,
    });
    expect(out.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved.status).toBe("revisi-terkirim");
    expect(saved.versions.map((v) => [v.version, v.wordCount])).toEqual([
      [1, 5],
      [2, 900],
    ]);
    expect(saved.versions[1].hash).toHaveLength(64);
    expect(saved.statusLog.at(-1)).toMatchObject({
      status: "revisi-terkirim",
      reason: "Sudah dipendekkan.",
    });
  });

  it("is allowed after the project deadline, because an editor asked for it", async () => {
    const closed = { ...esai, closesAt: Date.now() - 10 * DAY };
    const store = await setup();
    const out = await sendRevision({
      project: closed,
      submission: revising(),
      docId: "d1",
      note: "",
      documents: docs(900),
      store,
    });
    expect(out.kind).toBe("sent");
  });

  it("is refused after the revision deadline, and nothing is written", async () => {
    const late = revising({
      statusLog: [
        { status: "perlu-revisi", at: Date.now() - 9 * DAY, by: "editor", dueAt: Date.now() - DAY },
      ],
    });
    const store = await setup(late);
    const out = await sendRevision({
      project: esai,
      submission: late,
      docId: "d1",
      note: "",
      documents: docs(900),
      store,
    });
    expect(out).toMatchObject({ kind: "invalid" });
    expect(out.kind === "invalid" && out.problems[0].message).toBe("Tenggat revisi sudah lewat.");
    expect((await store.list())[0].versions).toHaveLength(1);
  });

  it("applies the word limits of the project to the new version", async () => {
    const store = await setup();
    const out = await sendRevision({
      project: esai,
      submission: revising(),
      docId: "d1",
      note: "",
      documents: docs(100),
      store,
    });
    expect(out.kind === "invalid" && out.problems[0].message).toContain(
      "kurang dari batas minimal",
    );
  });

  it("refuses a document that is already another work of this project", async () => {
    const cerpen = project("lomba-cerpen-hujan-2026", Date.now());
    const store = await setup(revising({ slug: cerpen.slug }));
    await store.add(submission({ id: "s2", slug: cerpen.slug, docId: "d2" }), 5);
    const out = await sendRevision({
      project: cerpen,
      submission: revising({ slug: cerpen.slug }),
      docId: "d2",
      note: "",
      documents: docs(900, "d2"),
      store,
    });
    expect(out.kind === "invalid" && out.problems[0].message).toContain("sudah dikirim");
  });

  it("refuses a document that has not changed since the last version, and spends no round", async () => {
    const work = revising();
    const store = await setup(work);
    const same = docs(900);
    const first = await sendRevision({
      project: esai,
      submission: work,
      docId: "d1",
      note: "",
      documents: same,
      store,
    });
    expect(first.kind).toBe("sent");

    // Back in Perlu Revisi, the same document again: nothing was edited, so nothing to send.
    await store.update("s1", (s) => ({ ...s, status: "perlu-revisi" }));
    const again = await sendRevision({
      project: esai,
      submission: work,
      docId: "d1",
      note: "",
      documents: same,
      store,
    });
    expect(again.kind === "invalid" && again.problems[0].message).toContain("belum berubah");
    expect((await store.list())[0].versions).toHaveLength(2);
  });

  it("accepts a different document that is free", async () => {
    const store = await setup();
    const out = await sendRevision({
      project: esai,
      submission: revising(),
      docId: "d7",
      note: "",
      documents: docs(900, "d7"),
      store,
    });
    expect(out.kind).toBe("sent");
    expect((await store.list())[0]).toMatchObject({ docId: "d7" });
  });

  it("says so when the work is gone, and reports a storage failure as failed", async () => {
    const store = createMemorySubmissionStore();
    const gone = await sendRevision({
      project: esai,
      submission: revising(),
      docId: "d1",
      note: "",
      documents: docs(900),
      store,
    });
    expect(gone.kind).toBe("invalid");

    const broken = { ...store, list: () => Promise.reject(new Error("idb")) };
    const failed = await sendRevision({
      project: esai,
      submission: revising(),
      docId: "d1",
      note: "",
      documents: docs(900),
      store: broken,
    });
    expect(failed).toEqual({ kind: "failed" });
  });

  it("tells every screen to read again", async () => {
    const store = await setup();
    const heard = vi.fn();
    const stop = onSubmissionsChanged(heard);
    await sendRevision({
      project: esai,
      submission: revising(),
      docId: "d1",
      note: "",
      documents: docs(900),
      store,
    });
    stop();
    expect(heard).toHaveBeenCalledTimes(1);
  });
});

describe("withdrawSubmission and reviewSubmission", () => {
  it("withdraws a work and frees it from counting", async () => {
    const store = await setup(submission({ id: "s1" }));
    expect(await withdrawSubmission(store, "s1")).toBe("ok");
    expect((await store.list())[0].status).toBe("ditarik");
  });

  it("is rejected when the status moved on in another tab", async () => {
    const store = await setup(submission({ id: "s1", status: "peninjauan" }));
    expect(await withdrawSubmission(store, "s1")).toBe("rejected");
    expect((await store.list())[0].status).toBe("peninjauan");
  });

  it("says missing for an unknown id, and failed when the store throws", async () => {
    const store = await setup();
    expect(await withdrawSubmission(store, "nope")).toBe("missing");
    const broken = { ...store, update: () => Promise.reject(new Error("idb")) };
    expect(await withdrawSubmission(broken, "s1")).toBe("failed");
  });

  it("records a reviewer's decision with its note", async () => {
    const store = await setup(submission({ id: "s1", status: "peninjauan" }));
    expect(await reviewSubmission(store, "s1", "diterima", "Layak terbit.")).toBe("ok");
    const [saved] = await store.list();
    expect(saved.status).toBe("diterima");
    expect(saved.statusLog.at(-1)).toMatchObject({ by: "editor", reason: "Layak terbit." });
  });

  it("notifies only when something changed", async () => {
    const store = await setup(submission({ id: "s1", status: "diterima" }));
    const heard = vi.fn();
    const stop = onSubmissionsChanged(heard);
    await withdrawSubmission(store, "s1");
    stop();
    expect(heard).not.toHaveBeenCalled();
  });
});
