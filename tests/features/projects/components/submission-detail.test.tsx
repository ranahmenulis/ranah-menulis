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
import { SubmissionDetail } from "@/features/projects/components/submission-detail";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { submission, textOf } from "../helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const CERPEN = "lomba-cerpen-hujan-2026";
const DAY = 86_400_000;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

/** A work sent three days ago and, optionally, asked to revise two days ago with `days` left. */
function work(over: Partial<Submission> = {}): Submission {
  const now = Date.now();
  return submission({
    id: "a",
    slug: CERPEN,
    title: "Hujan di Atap",
    submittedAt: now - 3 * DAY,
    statusLog: [{ status: "terkirim", at: now - 3 * DAY, by: "sistem" }],
    ...over,
  });
}

function asked(days = 5, over: Partial<Submission> = {}) {
  const now = Date.now();
  return work({
    status: "perlu-revisi",
    statusLog: [
      { status: "terkirim", at: now - 3 * DAY, by: "sistem" },
      { status: "peninjauan", at: now - 2.5 * DAY, by: "editor" },
      {
        status: "perlu-revisi",
        at: now - 2 * DAY,
        by: "editor",
        reason: "Perkuat paragraf pembuka.",
        dueAt: now + days * DAY,
      },
    ],
    ...over,
  });
}

async function open(w: Submission, store?: SubmissionStore) {
  const used = store ?? createMemorySubmissionStore();
  await used.add(w, 9);
  render(<SubmissionDetail slug={w.slug} id={w.id} store={used} />);
  await screen.findByRole("heading", { level: 1 });
  return used;
}

describe("SubmissionDetail", () => {
  it("shows the work, its status and what it means, with the way out to Proyek saya", async () => {
    await open(work());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hujan di Atap");
    expect(screen.getAllByText("Terkirim").length).toBeGreaterThan(0);
    expect(screen.getByText("Karyamu sudah diterima dan menunggu peninjau.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Proyek saya/ }).getAttribute("href")).toBe(
      "/projects/saya",
    );
    expect(screen.getByRole("link", { name: "Lomba Cerpen Hujan 2026" })).toBeTruthy();
  });

  it("lists the history of status and of versions, newest first", async () => {
    const w = asked(5, {
      versions: [
        { version: 1, content: textOf(5), wordCount: 1200, hash: "a".repeat(64), frozenAt: 1 },
        { version: 2, content: textOf(5), wordCount: 1300, hash: "b".repeat(64), frozenAt: 2 },
      ],
    });
    await open(w);
    const statusList = within(
      screen.getByRole("heading", { name: "Riwayat status" }).parentElement!,
    )
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(statusList[0]).toContain("Perlu Revisi");
    expect(statusList[0]).toContain("oleh peninjau");
    expect(statusList[0]).toContain("Perkuat paragraf pembuka.");
    expect(statusList.at(-1)).toContain("Terkirim");

    const versions = within(screen.getByRole("heading", { name: "Riwayat versi" }).parentElement!)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(versions[0]).toContain("Versi 2");
    expect(versions[0]).toContain("terbaru");
    expect(versions[0]).toContain("bbbbbbbbbbbbbbbb…");
    expect(versions[1]).toContain("Versi 1");
  });

  it("shows the editor's note and one filled button when a revision was asked for", async () => {
    await open(asked());
    expect(
      screen.getByText("Perkuat paragraf pembuka.", { selector: "p.font-serif" }),
    ).toBeTruthy();
    expect(screen.getByText(/Tenggat revisi .* WIB\. Revisi ke-1 dari 2\./)).toBeTruthy();
    const link = screen.getByRole("link", { name: "Kirim revisi" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/kiriman/a/revisi`);
    const filled = screen.getAllByRole("link").filter((a) => a.className.includes("bg-ink"));
    expect(filled).toHaveLength(1);
  });

  it("says why a revision cannot be sent once the deadline passed", async () => {
    await open(asked(-1));
    expect(screen.getByText("Tenggat revisi sudah lewat.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Kirim revisi" })).toBeNull();
  });

  it("shows the note of a decision, and offers nothing to withdraw after one", async () => {
    const now = Date.now();
    await open(
      work({
        status: "ditolak",
        statusLog: [
          { status: "terkirim", at: now - 3 * DAY, by: "sistem" },
          { status: "ditolak", at: now - DAY, by: "editor", reason: "Belum sesuai tema." },
        ],
      }),
    );
    expect(screen.getByText("Belum sesuai tema.", { selector: "p.font-serif" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tarik karya" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Kirim revisi" })).toBeNull();
  });

  it("shows the information given when sending", async () => {
    await open(work({ note: "Mohon dibaca pelan.", synopsis: "Sebuah hujan." }));
    expect(screen.getByText("Mohon dibaca pelan.")).toBeTruthy();
    expect(screen.getByText("Sebuah hujan.")).toBeTruthy();
  });

  it("keeps a very long title inside the page", async () => {
    const long = "Judul".repeat(50);
    await open(work({ title: long }));
    expect(screen.getByRole("heading", { level: 1 }).className).toContain("wrap-anywhere");
  });
});

describe("SubmissionDetail, withdrawing", () => {
  it("asks first, says what stays, and does nothing on Batal", async () => {
    const store = await open(work());
    fireEvent.click(screen.getByRole("button", { name: "Tarik karya" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Tarik karya ini?" });
    expect(dialog.textContent).toContain("tidak bisa dikembalikan");
    expect(dialog.textContent).toContain("tetap tersimpan");
    fireEvent.click(within(dialog).getByRole("button", { name: "Batal" }));
    expect((await store.list())[0].status).toBe("terkirim");
  });

  it("withdraws after confirming: the status changes and the actions go away", async () => {
    const store = await open(work());
    fireEvent.click(screen.getByRole("button", { name: "Tarik karya" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Tarik karya" }));

    await waitFor(async () => expect((await store.list())[0].status).toBe("ditarik"));
    expect(await screen.findByText("Kamu sudah menarik karya ini.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tarik karya" })).toBeNull();
    expect(screen.getAllByText("Ditarik").length).toBeGreaterThan(0);
  });

  it("says so, without changing anything, when the status moved on elsewhere", async () => {
    const store = await open(work());
    await store.update("a", (s) => ({ ...s, status: "peninjauan" }));
    fireEvent.click(screen.getByRole("button", { name: "Tarik karya" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Tarik karya" }));
    expect(await screen.findByText(/Status karya ini sudah berubah/)).toBeTruthy();
    expect((await store.list())[0].status).toBe("peninjauan");
  });

  it("reports a storage failure and keeps the work", async () => {
    const base = createMemorySubmissionStore();
    const store: SubmissionStore = { ...base, update: () => Promise.reject(new Error("idb")) };
    await open(work(), store);
    fireEvent.click(screen.getByRole("button", { name: "Tarik karya" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Tarik karya" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect((await base.list())[0].status).toBe("terkirim");
  });
});

describe("SubmissionDetail, the reviewer stand-in (development only)", () => {
  const panel = () => screen.getByRole("complementary", { name: /hanya untuk pengembangan/ });

  it("offers only the steps the table allows, and moves the status", async () => {
    const store = await open(work());
    expect(
      within(panel())
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Mulai tinjau"]);
    fireEvent.click(within(panel()).getByRole("button", { name: "Mulai tinjau" }));
    await screen.findByText("Karyamu sedang ditinjau.");
    expect(
      within(panel())
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Minta revisi", "Terima", "Tolak"]);
    expect((await store.list())[0].status).toBe("peninjauan");
  });

  it("asking for a revision gives the editor's note and a deadline on the page", async () => {
    await open(work({ status: "peninjauan" }));
    fireEvent.click(within(panel()).getByRole("button", { name: "Minta revisi" }));
    expect(await screen.findByRole("link", { name: "Kirim revisi" })).toBeTruthy();
    expect(screen.getByText(/Tenggat revisi/)).toBeTruthy();
  });

  it("is gone once the work is decided", async () => {
    await open(work({ status: "diterima" }));
    expect(screen.queryByRole("complementary", { name: /pengembangan/ })).toBeNull();
  });
});

describe("SubmissionDetail, when it cannot show the work", () => {
  it("says a work is not found, with the way to Proyek saya", async () => {
    render(<SubmissionDetail slug={CERPEN} id="nope" store={createMemorySubmissionStore()} />);
    expect(await screen.findByText("Karya ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat Proyek saya" })).toBeTruthy();
  });

  it("does not show a work under another project's address", async () => {
    const store = createMemorySubmissionStore();
    await store.add(work(), 9);
    render(<SubmissionDetail slug="lomba-esai-literasi-remaja" id="a" store={store} />);
    expect(await screen.findByText("Karya ini tidak ditemukan.")).toBeTruthy();
  });

  it("explains a failed read and retries", async () => {
    let fail = true;
    const base = createMemorySubmissionStore();
    await base.add(work(), 9);
    const store: SubmissionStore = {
      ...base,
      list: () => (fail ? Promise.reject(new Error("idb")) : base.list()),
    };
    render(<SubmissionDetail slug={CERPEN} id="a" store={store} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fail = false;
    await act(async () => screen.getByRole("button", { name: "Coba lagi" }).click());
    expect(await screen.findByRole("heading", { name: "Hujan di Atap" })).toBeTruthy();
  });

  it("asks a guest to sign in", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    render(<SubmissionDetail slug={CERPEN} id="a" store={createMemorySubmissionStore()} />);
    expect(await screen.findByText("Masuk untuk melihat proyek dan kirimanmu.")).toBeTruthy();
  });
});
