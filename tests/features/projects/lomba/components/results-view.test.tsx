import { act, cleanup, configure, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { advanceContest, markMineFinalist } from "@/features/projects/lomba/stage-store";
import { ResultsView } from "@/features/projects/lomba/components/results-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { register } from "../../components/submit-helpers";
import { submission } from "../../helpers";

configure({ asyncUtilTimeout: 5000 });

const OPEN = "lomba-cerpen-hujan-2026"; // anonymous, still open
const NAMED = "lomba-puisi-pendek-nusantara"; // not anonymous
const DONE = "lomba-cerita-mini-pesisir-2026"; // finished, anonymous, winners announced

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

async function open(slug: string, store: SubmissionStore = createMemorySubmissionStore()) {
  render(<ResultsView slug={slug} store={store} />);
  await screen.findByRole("heading", { level: 1 });
}

const back = () => screen.getByRole("link", { name: /Kembali ke proyek/ });
/** What the Organizer's stage tab does: push the contest on (the screen re-reads on its own). */
const push = (slug: string, stage: "dinilai" | "finalis" | "pemenang") =>
  act(async () => advanceContest(slug, stage));

describe("results of a finished contest", () => {
  it("shows the winners with prizes, names and the jury's note, and a way back", async () => {
    await open(DONE);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Lomba Cerita Mini Pesisir 2026",
    );
    expect(back().getAttribute("href")).toBe(`/projects/${DONE}`);
    expect(screen.getByText("Pemenang diumumkan")).toBeTruthy();
    const winners = screen.getByRole("heading", { name: "Pemenang" }).closest("section")!;
    const items = within(winners).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain("Juara 1 · Rp1.500.000");
    expect(items[0].textContent).toContain("Garam di Tepi Jendela");
    expect(within(items[0]).getByRole("link", { name: "Maya Anindita" }).getAttribute("href")).toBe(
      "/penulis/mayaanindita",
    );
    expect(items[0].textContent).toContain("Catatan juri:");
  });

  it("marks a tie as a tie", async () => {
    await open(DONE);
    const winners = screen.getByRole("heading", { name: "Pemenang" }).closest("section")!;
    const items = within(winners).getAllByRole("listitem");
    expect(items[1].textContent).toContain("Juara 2 (seri)");
    expect(items[2].textContent).toContain("Juara 2 (seri)");
  });

  it("lists every finalist, now with names because the winners are announced", async () => {
    await open(DONE);
    const finalists = screen.getByRole("heading", { name: "Finalis" }).closest("section")!;
    expect(within(finalists).getAllByRole("listitem")).toHaveLength(6);
    expect(within(finalists).getByRole("link", { name: "Hafiz Rahman" })).toBeTruthy();
  });

  it("shows the criteria, the schedule with what is done, and the anonymity rule", async () => {
    await open(DONE);
    expect(screen.getByText("Orisinalitas")).toBeTruthy();
    expect(screen.getAllByText("35%")).toHaveLength(2);
    expect(screen.getByText(/Penilaian anonim/)).toBeTruthy();
    expect(screen.getAllByText(/· selesai/)).toHaveLength(3);
  });

  it("is open to a guest", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    await open(DONE);
    expect(screen.getByRole("heading", { name: "Pemenang" })).toBeTruthy();
  });
});

describe("results before anything is announced", () => {
  it("says where it stands and when, instead of an empty list", async () => {
    await open(OPEN);
    expect(screen.getByText("Penerimaan karya")).toBeTruthy();
    expect(screen.getByText(/masih dibuka sampai .*Pemenang diumumkan/)).toBeTruthy();
    expect(screen.getByText(/Finalis belum diumumkan/)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Pemenang" })).toBeNull();
    expect(screen.getByText("Kriteria penilaian")).toBeTruthy();
  });
});

describe("a contest pushed on by its Organizer", () => {
  it("moves the stage on and hides names in an anonymous contest until the winners", async () => {
    await open(OPEN);
    await push(OPEN, "finalis");
    expect(screen.getByText("Finalis diumumkan")).toBeTruthy();
    const finalists = screen.getByRole("heading", { name: "Finalis" }).closest("section")!;
    expect(within(finalists).getByText(/Finalis 1/)).toBeTruthy();
    expect(within(finalists).queryByRole("link")).toBeNull();

    await push(OPEN, "pemenang");
    expect(screen.getByText("Pemenang diumumkan")).toBeTruthy();
    expect(
      within(screen.getByRole("heading", { name: "Finalis" }).closest("section")!).getAllByRole(
        "link",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("shows the names of a contest that is not anonymous from the finalists on", async () => {
    await open(NAMED);
    await push(NAMED, "finalis");
    const finalists = screen.getByRole("heading", { name: "Finalis" }).closest("section")!;
    expect(within(finalists).getByRole("link", { name: "Nur Aisyah" })).toBeTruthy();
  });

  it("says so when the reader's own work is a finalist", async () => {
    register(OPEN);
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", slug: OPEN, title: "Hujan di Atap", docId: "d1" }), 5);
    await open(OPEN, store);
    await push(OPEN, "finalis");
    await act(async () => markMineFinalist(OPEN));
    expect(await screen.findByText(/Karyamu “Hujan di Atap” masuk finalis/)).toBeTruthy();
    const finalists = screen.getByRole("heading", { name: "Finalis" }).closest("section")!;
    expect(within(finalists).getByText(/karyamu/)).toBeTruthy();
  });
});

describe("results that cannot be shown", () => {
  it("says not found for an unknown address and for a project that is not a contest", async () => {
    render(<ResultsView slug="tidak-ada" store={createMemorySubmissionStore()} />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
    cleanup();
    render(<ResultsView slug="kelas-cerpen-untuk-pemula" store={createMemorySubmissionStore()} />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
  });

  it("says the list is not on record when a contest has no results", async () => {
    render(<ResultsView slug={DONE} results={[]} store={createMemorySubmissionStore()} />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByText("Daftar pemenang belum tersedia.")).toBeTruthy();
    expect(screen.getByText("Daftar finalis belum tersedia.")).toBeTruthy();
  });
});
