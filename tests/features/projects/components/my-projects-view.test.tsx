import { cleanup, configure, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MyProjectsView } from "@/features/projects/components/my-projects-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { NOW, submission } from "../helpers";
import { register } from "./submit-helpers";

configure({ asyncUtilTimeout: 5000 });

const CERPEN = "lomba-cerpen-hujan-2026";
const KELAS = "kelas-cerpen-untuk-pemula";
const ESAI = "lomba-esai-literasi-remaja";
const DAY = 86_400_000;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

async function storeWith(...works: Submission[]) {
  const store = createMemorySubmissionStore();
  for (const work of works) await store.add(work, 9);
  return store;
}

async function view(store?: SubmissionStore) {
  render(<MyProjectsView store={store ?? createMemorySubmissionStore()} />);
  await screen.findByRole("heading", { level: 1 });
}

describe("Proyek saya", () => {
  it("has a way out to the catalog, and points to it when nothing was joined", async () => {
    await view();
    expect(screen.getByText("Kamu belum mengikuti proyek.")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Semua Projects|Lihat Projects/ })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Lihat Projects" })[0].getAttribute("href")).toBe(
      "/projects",
    );
  });

  it("shows each work with its status, linked to its own page", async () => {
    register(CERPEN);
    const store = await storeWith(
      submission({ id: "a", slug: CERPEN, title: "Hujan di Atap", docId: "d1" }),
    );
    await view(store);
    const group = await screen.findByRole("region", { name: /Lomba Cerpen Hujan 2026/ });
    const link = within(group).getByRole("link", { name: "Hujan di Atap" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/kiriman/a`);
    expect(within(group).getByText("Terkirim")).toBeTruthy();
    expect(within(group).getByText(/Terdaftar/)).toBeTruthy();
  });

  it("shows the registration, not a submission status, when nothing was sent", async () => {
    register(ESAI);
    register(KELAS);
    await view();
    const esai = await screen.findByRole("region", { name: /Lomba Esai/ });
    expect(within(esai).getByText(/Belum ada karya terkirim/)).toBeTruthy();
    expect(within(esai).getByRole("link", { name: "Kirim karya" }).getAttribute("href")).toBe(
      `/projects/${ESAI}/kirim`,
    );
    const kelas = screen.getByRole("region", { name: /Kelas Cerpen/ });
    expect(within(kelas).getByText(/Tugas kelas dikumpulkan/)).toBeTruthy();
    expect(screen.queryByText("Terkirim")).toBeNull();
  });

  it("does not offer to send while the payment is pending", async () => {
    register(CERPEN, { status: "menunggu-pembayaran" });
    await view();
    const group = await screen.findByRole("region", { name: /Lomba Cerpen/ });
    expect(within(group).getByText(/setelah pembayaran selesai/)).toBeTruthy();
    expect(within(group).queryByRole("link", { name: "Kirim karya" })).toBeNull();
  });

  it("names the revision deadline and lists the work that needs action first", async () => {
    register(CERPEN);
    register(ESAI);
    const store = await storeWith(
      submission({ id: "q", slug: ESAI, docId: "d2", submittedAt: NOW }),
      submission({
        id: "r",
        slug: CERPEN,
        docId: "d1",
        status: "perlu-revisi",
        submittedAt: NOW - 5 * DAY,
        statusLog: [
          { status: "terkirim", at: NOW - 5 * DAY, by: "sistem" },
          { status: "perlu-revisi", at: NOW - DAY, by: "editor", dueAt: NOW + 6 * DAY },
        ],
      }),
    );
    await view(store);
    const regions = await screen.findAllByRole("region");
    expect(regions[0].textContent).toContain("Lomba Cerpen Hujan 2026");
    expect(regions[0].textContent).toContain("Perlu Revisi");
    expect(regions[0].textContent).toMatch(/tenggat revisi \d+ \w+ 2026/);
  });

  it("keeps long titles from breaking the layout", async () => {
    register(CERPEN);
    const long = "Kata".repeat(60);
    const store = await storeWith(submission({ id: "a", slug: CERPEN, title: long }));
    await view(store);
    const link = await screen.findByRole("link", { name: long });
    expect(link.className).toContain("wrap-anywhere");
  });

  it("says the data could not be read, with a retry, instead of showing an empty list", async () => {
    register(CERPEN);
    let fail = true;
    const store: SubmissionStore = {
      ...createMemorySubmissionStore(),
      list: () => (fail ? Promise.reject(new Error("idb")) : Promise.resolve([])),
    };
    render(<MyProjectsView store={store} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("Kamu belum mengikuti proyek.")).toBeNull();
    expect(screen.getByRole("link", { name: /Semua Projects/ })).toBeTruthy();

    fail = false;
    screen.getByRole("button", { name: "Coba lagi" }).click();
    expect(await screen.findByRole("region", { name: /Lomba Cerpen/ })).toBeTruthy();
  });

  it("asks a guest to sign in", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    render(<MyProjectsView store={createMemorySubmissionStore()} />);
    expect(await screen.findByText("Masuk untuk melihat proyek dan kirimanmu.")).toBeTruthy();
  });
});
