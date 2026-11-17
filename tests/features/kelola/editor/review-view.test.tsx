import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installDialogShim } from "@/test/dialog-shim";
import { ReviewView } from "@/features/kelola/editor/components/review-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { submissionNotifications } from "@/features/projects/submission-notifications";
import type { Submission } from "@/features/projects/submission-types";
import { submission, textOf } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const ASSIGNED = "antologi-surat-yang-tidak-pernah-terkirim";
const NOW = () => Date.now();

function work(over: Partial<Submission> = {}) {
  const at = NOW() - 1000;
  return submission({
    id: "a",
    slug: ASSIGNED,
    title: "Surat untuk Ibu",
    submittedAt: at,
    statusLog: [{ status: "terkirim", at, by: "sistem" }],
    ...over,
  });
}

async function open(row: Submission, store: SubmissionStore = createMemorySubmissionStore()) {
  await store.add(row, 99);
  render(<ReviewView id={row.id} store={store} />);
  return store;
}

beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem("rm-roles", "editor");
});
afterEach(cleanup);

const steps = () =>
  within(screen.getByRole("region", { name: "Langkah berikutnya" }))
    .getAllByRole("button")
    .map((b) => b.textContent);

describe("ReviewView", () => {
  it("shows the work, its status in the reviewer's words, and the one step it allows", async () => {
    await open(work());
    expect(await screen.findByRole("heading", { name: "Surat untuk Ibu", level: 1 })).toBeTruthy();
    expect(screen.getByText("Karya ini menunggu kamu mulai meninjau.")).toBeTruthy();
    expect(screen.getByText("kata kata kata kata kata")).toBeTruthy();
    expect(steps()).toEqual(["Mulai tinjau"]);
    expect(screen.getByRole("link", { name: /Antrean submission/ }).getAttribute("href")).toBe(
      "/kelola/editor",
    );
  });

  it("starts the review in one click and moves focus to the title", async () => {
    const store = await open(work());
    fireEvent.click(await screen.findByRole("button", { name: "Mulai tinjau" }));
    await screen.findByText(/sedang ditinjau\. Putuskan/);
    expect(steps()).toEqual(["Minta revisi", "Terima", "Tolak"]);
    expect((await store.list())[0].status).toBe("peninjauan");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 })),
    );
  });

  it("asks for a reason, keeps the dialog and changes nothing while it is empty", async () => {
    const store = await open(work({ status: "peninjauan" }));
    fireEvent.click(await screen.findByRole("button", { name: "Tolak" }));
    const dialog = await screen.findByRole("dialog", { name: "Tolak karya ini" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Tolak" }));
    expect(within(dialog).getByText(/Tulis alasannya/)).toBeTruthy();
    expect(document.activeElement).toBe(within(dialog).getByLabelText(/Alasan/));
    expect((await store.list())[0].status).toBe("peninjauan");
  });

  it("asks for a revision with a note, and the participant gets it in a notification", async () => {
    const store = await open(work({ status: "peninjauan" }));
    fireEvent.click(await screen.findByRole("button", { name: "Minta revisi" }));
    const dialog = await screen.findByRole("dialog", { name: "Minta revisi" });
    fireEvent.change(within(dialog).getByLabelText(/Alasan/), {
      target: { value: "  Perkuat paragraf pembuka.  " },
    });
    await act(async () => within(dialog).getByRole("button", { name: "Minta revisi" }).click());
    await screen.findByText("Menunggu revisi dari peserta.");
    const [saved] = await store.list();
    expect(saved.status).toBe("perlu-revisi");
    const last = saved.statusLog.at(-1);
    expect(last?.reason).toBe("Perkuat paragraf pembuka.");
    expect(last?.by).toBe("editor");
    expect(last?.dueAt).toBeGreaterThan(NOW());
    expect(submissionNotifications([saved]).map((n) => n.text)).toContainEqual(
      expect.stringMatching(/Editor meminta revisi untuk/),
    );
    expect(screen.queryByRole("region", { name: "Langkah berikutnya" })).toBeNull();
  });

  it("accepts a work with a reason, and then offers no further step", async () => {
    const store = await open(work({ status: "peninjauan" }));
    fireEvent.click(await screen.findByRole("button", { name: "Terima" }));
    const dialog = await screen.findByRole("dialog", { name: "Terima karya ini" });
    fireEvent.change(within(dialog).getByLabelText(/Alasan/), {
      target: { value: "Layak terbit." },
    });
    await act(async () => within(dialog).getByRole("button", { name: "Terima" }).click());
    await screen.findByText("Karya ini sudah diterima.");
    expect((await store.list())[0].status).toBe("diterima");
    expect(screen.queryByRole("button", { name: "Tolak" })).toBeNull();
  });

  it("says so, and changes nothing, when the status moved on in another tab", async () => {
    const store = await open(work());
    await screen.findByRole("button", { name: "Mulai tinjau" });
    await store.update("a", (s) => ({ ...s, status: "ditarik" }));
    fireEvent.click(screen.getByRole("button", { name: "Mulai tinjau" }));
    expect(await screen.findByText(/Status karya ini sudah berubah/)).toBeTruthy();
    expect((await store.list())[0].status).toBe("ditarik");
  });

  it("reports a storage failure", async () => {
    const base = createMemorySubmissionStore();
    const store: SubmissionStore = { ...base, update: () => Promise.reject(new Error("idb")) };
    await open(work(), store);
    fireEvent.click(await screen.findByRole("button", { name: "Mulai tinjau" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect((await base.list())[0].status).toBe("terkirim");
  });

  it("blocks another round of revision after the limit and says why", async () => {
    const spent = work({
      status: "peninjauan",
      statusLog: [1, 2].map((n) => ({
        status: "revisi-terkirim" as const,
        at: n,
        by: "peserta" as const,
      })),
    });
    await open(spent);
    const revise = await screen.findByRole("button", { name: "Minta revisi" });
    expect((revise as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Batas putaran revisi sudah tercapai/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Terima" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("lets the reviewer read each version after a revision, the newest first", async () => {
    const v = (n: number, text: string) => ({
      version: n,
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] },
      wordCount: 3,
      hash: `h${n}`,
      frozenAt: n,
    });
    await open(work({ versions: [v(1, "Isi versi satu"), v(2, "Isi versi dua")] }));
    expect(await screen.findByText("Isi versi dua")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Versi 1" }));
    expect(screen.getByText("Isi versi satu")).toBeTruthy();
    expect(screen.queryByText("Isi versi dua")).toBeNull();
  });

  it("renders the text of a document without trusting it as HTML", async () => {
    const evil = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "<img src=x onerror=alert(1)>" }] },
        { type: "nodeAsing", content: [{ type: "text", text: "tak dikenal" }] },
      ],
    };
    await open(work({ versions: [{ ...work().versions[0], content: evil }] }));
    expect(await screen.findByText("<img src=x onerror=alert(1)>")).toBeTruthy();
    expect(document.querySelector("img")).toBeNull();
  });

  it("shows an empty version as such", async () => {
    await open(work({ versions: [{ ...work().versions[0], content: textOf(0) }] }));
    expect(await screen.findByText("Versi ini tidak berisi teks.")).toBeTruthy();
  });

  it("refuses work that is not assigned, with the way back", async () => {
    await open(work({ slug: "antologi-puisi-tengah-malam" }));
    expect(await screen.findByText("Karya ini tidak ditugaskan kepadamu.")).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Langkah berikutnya" })).toBeNull();
    expect(screen.getByRole("link", { name: "Kembali ke antrean" }).getAttribute("href")).toBe(
      "/kelola/editor",
    );
  });

  it("refuses a Lomba work, even for an Administrator", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    await open(work({ slug: "lomba-esai-literasi-remaja" }));
    expect(await screen.findByText(/dinilai Juri/)).toBeTruthy();
  });

  it("lets an Administrator review work of any Antologi project", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    await open(work({ slug: "antologi-puisi-tengah-malam" }));
    expect(await screen.findByRole("button", { name: "Mulai tinjau" })).toBeTruthy();
  });

  it("says a work is not found, with the way back", async () => {
    render(<ReviewView id="nope" store={createMemorySubmissionStore()} />);
    expect(await screen.findByText("Karya ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke antrean" })).toBeTruthy();
  });

  it("explains a failed read and retries", async () => {
    let fail = true;
    const base = createMemorySubmissionStore();
    await base.add(work(), 9);
    const store: SubmissionStore = {
      ...base,
      list: () => (fail ? Promise.reject(new Error("idb")) : base.list()),
    };
    render(<ReviewView id="a" store={store} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fail = false;
    await act(async () => screen.getByRole("button", { name: "Coba lagi" }).click());
    expect(await screen.findByRole("heading", { name: "Surat untuk Ibu", level: 1 })).toBeTruthy();
  });
});
