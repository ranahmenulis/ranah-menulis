import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reviewAssignment } from "@/features/projects/kelas/assignment-actions";
import { handInAssignment, resubmitAssignment } from "@/features/projects/kelas/assignment-flow";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { onAssignmentsChanged } from "@/features/projects/kelas/storage/assignment-events";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { NOW, textOf } from "../helpers";
import { CERPEN, classOf, handedIn, PUISI } from "./helpers";

function docs(words = 10) {
  const doc: StudioDocument = {
    id: "d1",
    title: "Kerangka",
    content: textOf(words),
    wordCount: words,
    version: 1,
    updatedAt: 1,
  };
  return { get: vi.fn(async (id: string) => (id === doc.id ? doc : null)) };
}

const studio = { source: "studio" as const, docId: "d1", text: "" };
const typed = (text: string) => ({ source: "teks" as const, docId: null, text });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe("handInAssignment", () => {
  it("freezes the document and logs the hand-in", async () => {
    const store = createMemoryAssignmentStore();
    const out = await handInAssignment({
      content: classOf(CERPEN),
      assignmentId: "tugas-2",
      form: studio,
      documents: docs(10),
      store,
    });
    expect(out.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved).toMatchObject({ assignmentId: "tugas-2", status: "dikumpulkan", late: false });
    expect(saved.versions[0].wordCount).toBe(10);
  });

  it("accepts typed text and marks it late after the deadline", async () => {
    const store = createMemoryAssignmentStore();
    const out = await handInAssignment({
      content: classOf(CERPEN),
      assignmentId: "tugas-1", // due yesterday
      form: typed("Ide ceritaku.\n\nKerangkanya."),
      documents: docs(),
      store,
    });
    expect(out.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved.late).toBe(true);
    expect(saved.source).toBe("teks");
    expect(saved.versions[0].wordCount).toBe(3);
  });

  it("is closed before the class starts, and for an unknown assignment", async () => {
    const store = createMemoryAssignmentStore();
    const base = { form: typed("kata"), documents: docs(), store };
    const early = await handInAssignment({
      ...base,
      content: classOf(PUISI),
      assignmentId: "tugas-1",
    });
    expect(early).toMatchObject({ kind: "invalid", problems: [{ field: "closed" }] });
    const gone = await handInAssignment({ ...base, content: classOf(CERPEN), assignmentId: "x" });
    expect(gone).toMatchObject({ kind: "invalid", problems: [{ field: "closed" }] });
    expect(await store.list()).toEqual([]);
  });

  it("keeps the first hand-in when it is sent twice", async () => {
    const store = createMemoryAssignmentStore();
    const input = {
      content: classOf(CERPEN),
      assignmentId: "tugas-2",
      form: studio,
      documents: docs(),
      store,
    };
    await handInAssignment(input);
    const second = await handInAssignment(input);
    expect(second).toMatchObject({
      kind: "invalid",
      problems: [{ message: "Tugas ini sudah dikumpulkan." }],
    });
    expect(await store.list()).toHaveLength(1);
  });

  it("reads the document again at sending", async () => {
    const store = createMemoryAssignmentStore();
    const out = await handInAssignment({
      content: classOf(CERPEN),
      assignmentId: "tugas-2",
      form: studio,
      documents: docs(0),
      store,
    });
    expect(out).toMatchObject({ kind: "invalid", problems: [{ field: "doc" }] });
  });

  it("reports a failed write instead of throwing", async () => {
    const store = createMemoryAssignmentStore();
    store.add = () => Promise.reject(new Error("quota"));
    const out = await handInAssignment({
      content: classOf(CERPEN),
      assignmentId: "tugas-2",
      form: studio,
      documents: docs(),
      store,
    });
    expect(out).toEqual({ kind: "failed" });
  });

  it("tells screens to read again", async () => {
    const listener = vi.fn();
    const stop = onAssignmentsChanged(listener);
    await handInAssignment({
      content: classOf(CERPEN),
      assignmentId: "tugas-2",
      form: studio,
      documents: docs(),
      store: createMemoryAssignmentStore(),
    });
    stop();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("mentor decision and resubmission", () => {
  async function repairing() {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ id: "a1" }));
    await reviewAssignment(store, "a1", "perlu-perbaikan", "Tambahkan tokoh.");
    return store;
  }

  it("lets the mentor ask for a repair and the participant hand in again", async () => {
    const store = await repairing();
    const out = await resubmitAssignment({
      submissionId: "a1",
      form: typed("Versi baru yang lebih panjang."),
      documents: docs(),
      store,
    });
    expect(out.kind).toBe("sent");
    const [saved] = await store.list();
    expect(saved.status).toBe("dikumpulkan");
    expect(saved.versions.map((v) => v.version)).toEqual([1, 2]);
  });

  it("refuses the same content again", async () => {
    const store = createMemoryAssignmentStore();
    const text = "Sama persis.";
    await handInAssignment({
      content: classOf(CERPEN),
      assignmentId: "tugas-2",
      form: typed(text),
      documents: docs(),
      store,
    });
    const [first] = await store.list();
    await reviewAssignment(store, first.id, "perlu-perbaikan", "Ubah.");
    const out = await resubmitAssignment({
      submissionId: first.id,
      form: typed(text),
      documents: docs(),
      store,
    });
    expect(out).toMatchObject({ kind: "invalid", problems: [{ field: "text" }] });
  });

  it("refuses a resubmission when no repair was asked for", async () => {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ id: "a1" }));
    const out = await resubmitAssignment({
      submissionId: "a1",
      form: typed("Baru."),
      documents: docs(),
      store,
    });
    expect(out).toMatchObject({ kind: "invalid", problems: [{ field: "closed" }] });
  });

  it("refuses a decision the table does not allow, and a missing row", async () => {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ id: "a1", status: "selesai" }));
    expect(await reviewAssignment(store, "a1", "selesai")).toBe("rejected");
    expect(await reviewAssignment(store, "zzz", "selesai")).toBe("missing");
  });
});
