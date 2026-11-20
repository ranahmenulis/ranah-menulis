import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectRows } from "@/features/home/project-rows";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { NOW, registration, submission } from "../projects/helpers";

configure({ asyncUtilTimeout: 5000 });

const CERPEN = "lomba-cerpen-hujan-2026";
const KELAS = "kelas-cerpen-untuk-pemula";
const DAY = 86_400_000;

function register(...slugs: string[]) {
  localStorage.setItem(
    "ranah.registrations",
    JSON.stringify(Object.fromEntries(slugs.map((s) => [s, registration(s)]))),
  );
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

const asked = (): Submission => {
  const now = Date.now();
  return submission({
    id: "r",
    slug: CERPEN,
    title: "Hujan di Atap",
    status: "perlu-revisi",
    statusLog: [
      { status: "terkirim", at: now - 3 * DAY, by: "sistem" },
      { status: "perlu-revisi", at: now - DAY, by: "editor", dueAt: now + 6 * DAY },
    ],
  });
};

async function storeWith(...works: Submission[]) {
  const store = createMemorySubmissionStore();
  for (const work of works) await store.add(work, 9);
  return store;
}

describe("Beranda, Perlu perhatian", () => {
  it("puts a revision the editor asked for first, linking to its note", async () => {
    register(CERPEN);
    render(
      <ProjectRows store={await storeWith(asked())} assignments={createMemoryAssignmentStore()} />,
    );
    const link = await screen.findByRole("link", { name: "Baca catatan editor" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/kiriman/r`);
    const first = screen.getAllByRole("listitem")[0];
    expect(first.textContent).toContain("Editor meminta revisi untuk “Hujan di Atap”");
    expect(first.textContent).toMatch(/Lomba Cerpen Hujan 2026 · tenggat revisi \d+ \w+ 2026/);
  });

  it("omits the row when no project needs attention", () => {
    render(
      <ProjectRows
        store={createMemorySubmissionStore()}
        assignments={createMemoryAssignmentStore()}
      />,
    );
    expect(screen.queryByText("Perlu perhatian")).toBeNull();
    expect(screen.queryByRole("link", { name: "Baca catatan editor" })).toBeNull();
  });

  it("shows the project error when submissions cannot be read", async () => {
    register(CERPEN);
    const store: SubmissionStore = {
      ...createMemorySubmissionStore(),
      list: () => Promise.reject(new Error("idb")),
    };
    render(<ProjectRows store={store} assignments={createMemoryAssignmentStore()} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
  });
});

describe("Beranda, pembayaran", () => {
  it("asks to pay a registration that waits, linking to the payment page", async () => {
    const now = Date.now();
    localStorage.setItem(
      "ranah.registrations",
      JSON.stringify({
        [CERPEN]: {
          slug: CERPEN,
          registeredAt: now - 1000,
          agreedAt: now - 1000,
          termsVersion: "1",
          status: "menunggu-pembayaran",
        },
      }),
    );
    render(
      <ProjectRows
        store={createMemorySubmissionStore()}
        assignments={createMemoryAssignmentStore()}
      />,
    );
    expect(await screen.findByText("Pembayaran Lomba Cerpen Hujan 2026 menunggu")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Bayar sekarang" }).getAttribute("href")).toBe(
      `/projects/${CERPEN}/bayar`,
    );
  });
});

describe("Beranda, Proyek saya", () => {
  it("shows the status of the work that matters most, with the way to all", async () => {
    register(CERPEN);
    render(
      <ProjectRows store={await storeWith(asked())} assignments={createMemoryAssignmentStore()} />,
    );
    const link = await screen.findByRole("link", { name: "Lomba Cerpen Hujan 2026" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/kiriman/r`);
    expect(screen.getByText("Perlu Revisi")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat semua" }).getAttribute("href")).toBe(
      "/projects/saya",
    );
  });

  it("shows the registration when nothing was sent, and no more than two projects", async () => {
    register(CERPEN, KELAS, "lomba-esai-literasi-remaja");
    render(
      <ProjectRows
        store={createMemorySubmissionStore()}
        assignments={createMemoryAssignmentStore()}
      />,
    );
    await screen.findByRole("link", { name: "Lihat semua" });
    const row = screen.getByText("Proyek saya").parentElement!;
    const items = within(row).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Terdaftar")).toBeTruthy();
    expect(items[0].textContent).toContain("Belum ada karya terkirim");
  });

  it("is not drawn when nothing was joined", () => {
    render(
      <ProjectRows
        store={createMemorySubmissionStore()}
        assignments={createMemoryAssignmentStore()}
      />,
    );
    expect(screen.queryByText("Proyek saya")).toBeNull();
  });

  it("does not let a withdrawn work hide one that is still in play", async () => {
    register(CERPEN);
    const live = submission({
      id: "live",
      slug: CERPEN,
      docId: "d1",
      title: "Masih Hidup",
      submittedAt: NOW - DAY,
    });
    const gone = submission({
      id: "gone",
      slug: CERPEN,
      docId: "d2",
      title: "Sudah Ditarik",
      status: "ditarik",
      submittedAt: NOW,
    });
    render(
      <ProjectRows
        store={await storeWith(live, gone)}
        assignments={createMemoryAssignmentStore()}
      />,
    );
    expect(
      (await screen.findByRole("link", { name: "Lomba Cerpen Hujan 2026" })).getAttribute("href"),
    ).toBe(`/projects/${CERPEN}/kiriman/live`);
    expect(screen.getByText("“Masih Hidup”")).toBeTruthy();
  });

  it("fails on its own, with a retry", async () => {
    let fail = true;
    const base = createMemorySubmissionStore();
    const store: SubmissionStore = {
      ...base,
      list: () => (fail ? Promise.reject(new Error("idb")) : base.list()),
    };
    register(CERPEN);
    render(<ProjectRows store={store} assignments={createMemoryAssignmentStore()} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fail = false;
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByRole("link", { name: "Lihat semua" })).toBeTruthy();
  });
});
