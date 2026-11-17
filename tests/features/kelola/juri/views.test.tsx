import { act, cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: vi.fn() }),
}));

import { ContestWorksView } from "@/features/kelola/juri/components/contest-works-view";
import { ContestsView } from "@/features/kelola/juri/components/contests-view";
import { ScoreView } from "@/features/kelola/juri/components/score-view";
import { judgingLog, juryScores } from "@/features/kelola/juri/score-store";
import { ContestStagePanel } from "@/features/kelola/organizer/components/contest-stage-panel";
import { staffAssignments } from "@/features/kelola/staff-assignments";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { advanceContest } from "@/features/projects/lomba/stage-store";
import { resolveProjects } from "@/features/projects/project-model";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { installDialogShim } from "@/test/dialog-shim";
import { submission } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const SLUG = "lomba-cerpen-hujan-2026"; // anonymous, four weighted criteria
const NAMED = "lomba-puisi-pendek-nusantara";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  juryScores.reset();
  judgingLog.reset();
  staffAssignments.reset();
  sessionStorage.setItem("rm-roles", "juri");
  window.history.replaceState(null, "", `/kelola/juri/${SLUG}`);
});
afterEach(cleanup);

const work = (id: string, over: Partial<Submission> = {}) =>
  submission({
    id,
    slug: SLUG,
    title: `Judul ${id}`,
    genre: "Cerpen",
    submittedAt: id === "a" ? 1 : 2,
    ...over,
  });

async function storeWith(...works: Submission[]) {
  const store = createMemorySubmissionStore();
  for (const [i, w] of works.entries()) await store.add({ ...w, docId: `d${i}` }, 5);
  return store;
}

const open = () => act(async () => advanceContest(SLUG, "dinilai"));

function scoreAll(value: string) {
  for (const name of ["Orisinalitas", "Kekuatan cerita", "Bahasa", "Kesesuaian dengan tema"]) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${name}`)), { target: { value } });
  }
}

describe("ContestsView", () => {
  it("lists the assigned contest with how many works were scored", async () => {
    render(<ContestsView store={await storeWith(work("a"), work("b"))} />);
    const link = await screen.findByRole("link", { name: /Lomba Cerpen Hujan 2026/ });
    expect(link.getAttribute("href")).toBe(`/kelola/juri/${SLUG}`);
    expect(within(link).getByText("0 dari 2 karya sudah kamu nilai")).toBeTruthy();
    expect(screen.queryByText(/Puisi Pendek/)).toBeNull();
  });

  it("is empty for someone with no contest assigned", async () => {
    staffAssignments.write([]);
    render(<ContestsView store={await storeWith()} />);
    expect(await screen.findByText("Belum ada lomba yang ditugaskan kepadamu.")).toBeTruthy();
  });

  it("lists every contest for an Administrator", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    render(<ContestsView store={await storeWith()} />);
    expect(await screen.findByRole("link", { name: /Puisi Pendek Nusantara/ })).toBeTruthy();
  });
});

describe("ContestWorksView", () => {
  it("labels works by number and names no author in an anonymous contest", async () => {
    render(<ContestWorksView slug={SLUG} store={await storeWith(work("a"), work("b"))} />);
    const list = await screen.findByRole("list", { name: "Daftar karya" });
    expect(within(list).getByText("Karya 1 · Judul a")).toBeTruthy();
    expect(within(list).getByText("Karya 2 · Judul b")).toBeTruthy();
    expect(screen.getByText(/Lomba anonim: nama penulis tidak ditampilkan/)).toBeTruthy();
  });

  it("filters by what the viewer scored and offers a way back from an empty filter", async () => {
    render(<ContestWorksView slug={SLUG} store={await storeWith(work("a"))} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Sudah dinilai/ }));
    expect(screen.getByText("Belum ada karya yang kamu nilai.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lihat semua karya" }));
    expect(await screen.findByRole("list", { name: "Daftar karya" })).toBeTruthy();
  });

  it("refuses a contest that is not assigned, with a way back", async () => {
    render(<ContestWorksView slug={NAMED} store={await storeWith()} />);
    expect(await screen.findByText("Lomba ini tidak ditugaskan kepadamu.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke penilaian" })).toBeTruthy();
  });

  it("says not found for an unknown address and for a project that is not a contest", async () => {
    render(<ContestWorksView slug="tidak-ada" store={await storeWith()} />);
    expect(await screen.findByText("Lomba ini tidak ditemukan.")).toBeTruthy();
    cleanup();
    render(<ContestWorksView slug="kelas-cerpen-untuk-pemula" store={await storeWith()} />);
    expect(await screen.findByText("Lomba ini tidak ditemukan.")).toBeTruthy();
  });
});

describe("ScoreView", () => {
  it("waits for the contest to stop taking work", async () => {
    render(<ScoreView slug={SLUG} id="a" store={await storeWith(work("a"))} />);
    expect(
      await screen.findAllByText(/Penilaian dimulai setelah penerimaan karya ditutup/),
    ).toBeTruthy();
    expect((screen.getByLabelText(/^Orisinalitas/) as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Simpan penilaian" })).toBeNull();
  });

  it("names the criteria that fail and keeps what was typed", async () => {
    await open();
    render(<ScoreView slug={SLUG} id="a" store={await storeWith(work("a"))} />);
    fireEvent.change(await screen.findByLabelText(/^Orisinalitas/), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/^Bahasa/), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan penilaian" }));
    // Bahasa is 20, and the two criteria left empty fail too.
    expect(screen.getAllByText("Isi angka bulat 1 sampai 10.")).toHaveLength(3);
    expect((screen.getByLabelText(/^Orisinalitas/) as HTMLInputElement).value).toBe("5");
    expect(juryScores.read()).toHaveLength(0);
  });

  it("saves, says the weighted score, and shows no author", async () => {
    await open();
    render(<ScoreView slug={SLUG} id="a" store={await storeWith(work("a"))} />);
    await screen.findByLabelText(/^Orisinalitas/);
    scoreAll("8");
    fireEvent.change(screen.getByLabelText("Catatan (opsional)"), { target: { value: "Kuat." } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan penilaian" }));
    expect(await screen.findByText(/Penilaian disimpan\. Skormu 8\./)).toBeTruthy();
    expect(juryScores.read()[0]).toMatchObject({ submissionId: "a", note: "Kuat." });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Karya 1 · Judul a");
    expect(screen.getByText(/penulis tidak ditampilkan/)).toBeTruthy();
  });

  it("is read-only once judging is closed, and says why", async () => {
    await open();
    judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]);
    render(<ScoreView slug={SLUG} id="a" store={await storeWith(work("a"))} />);
    expect(await screen.findAllByText(/Penilaian ditutup/)).toBeTruthy();
    expect((screen.getByLabelText(/^Bahasa/) as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Simpan penilaian" })).toBeNull();
  });

  it("refuses a save from a form opened before judging was closed", async () => {
    await open();
    render(<ScoreView slug={SLUG} id="a" store={await storeWith(work("a"))} />);
    await screen.findByLabelText(/^Orisinalitas/);
    scoreAll("7");
    act(() => judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]));
    expect(await screen.findAllByText(/Penilaian ditutup/)).toBeTruthy();
    expect(juryScores.read()).toHaveLength(0);
  });

  it("says not found for a draft or another contest's work", async () => {
    await open();
    render(<ScoreView slug={SLUG} id="d" store={await storeWith(work("d", { status: "draf" }))} />);
    expect(await screen.findByText("Karya ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke karya lomba" })).toBeTruthy();
  });
});

describe("closing judging from the Organizer's stage tab", () => {
  const [project] = resolveProjects(
    projectFixtures.filter((p) => p.slug === SLUG),
    Date.now(),
  );

  it("closes after asking, then only an Administrator can reopen it, with a note", async () => {
    sessionStorage.setItem("rm-roles", "organizer");
    await open();
    const { unmount } = render(<ContestStagePanel project={project} now={Date.now()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Tutup penilaian" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Tutup penilaian?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Tutup penilaian" }));
    expect(await screen.findByText("Penilaian ditutup.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Buka penilaian kembali" })).toBeNull();
    expect(screen.getByText(/Hanya Administrator yang bisa membukanya kembali/)).toBeTruthy();
    unmount();

    sessionStorage.setItem("rm-roles", "administrator");
    render(<ContestStagePanel project={project} now={Date.now()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Buka penilaian kembali" }));
    const reason = await screen.findByRole("dialog", { name: "Buka penilaian kembali?" });
    fireEvent.click(within(reason).getByRole("button", { name: "Buka kembali" }));
    expect(within(reason).getByText(/Tulis alasannya/)).toBeTruthy();
    fireEvent.change(within(reason).getByLabelText("Catatan"), {
      target: { value: "Satu karya terlewat" },
    });
    fireEvent.click(within(reason).getByRole("button", { name: "Buka kembali" }));
    expect(await screen.findByText("Penilaian dibuka kembali.")).toBeTruthy();
    expect(judgingLog.read().at(-1)).toMatchObject({
      state: "dibuka",
      note: "Satu karya terlewat",
    });
  });

  it("does not offer to close judging before the contest stops taking work", async () => {
    sessionStorage.setItem("rm-roles", "organizer");
    render(<ContestStagePanel project={project} now={Date.now()} />);
    expect(
      await screen.findByText(/Penilaian dimulai setelah penerimaan karya ditutup/),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tutup penilaian" })).toBeNull();
  });
});
