import { act, cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

import { QueueView } from "@/features/kelola/editor/components/queue-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { submission } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });

const ASSIGNED = "antologi-surat-yang-tidak-pernah-terkirim";

function work(
  id: string,
  status: Submission["status"],
  at: number,
  over: Partial<Submission> = {},
) {
  return submission({
    id,
    docId: `doc-${id}`,
    slug: ASSIGNED,
    title: `Karya ${id}`,
    status,
    submittedAt: at,
    statusLog: [{ status, at, by: "sistem" }],
    ...over,
  });
}

async function open(...rows: Submission[]) {
  const store = createMemorySubmissionStore();
  for (const row of rows) await store.add(row, 99);
  render(<QueueView store={store} />);
  return store;
}

beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem("rm-roles", "editor");
  window.history.replaceState(null, "", "/kelola/editor");
});
afterEach(cleanup);

const chip = (name: RegExp) => screen.getByRole("button", { name });
const titles = () =>
  within(screen.getByRole("table"))
    .getAllByRole("link")
    .map((a) => a.textContent);

describe("QueueView", () => {
  it("opens on the work that needs action, longest waiting first, and counts every filter", async () => {
    await open(
      work("baru", "terkirim", 300),
      work("lama", "terkirim", 100),
      work("tinjau", "peninjauan", 200),
      work("beres", "diterima", 50),
    );
    expect(await screen.findByRole("heading", { name: "Antrean submission" })).toBeTruthy();
    expect(chip(/Perlu tindakan 2/).getAttribute("aria-pressed")).toBe("true");
    expect(chip(/Sedang ditinjau 1/)).toBeTruthy();
    expect(chip(/Selesai 1/)).toBeTruthy();
    expect(chip(/Semua 4/)).toBeTruthy();
    expect(titles()).toEqual(["Karya lama", "Karya baru"]);
  });

  it("links each row to its review page", async () => {
    await open(work("a", "terkirim", 1));
    const link = await screen.findByRole("link", { name: "Karya a" });
    expect(link.getAttribute("href")).toBe("/kelola/editor/a");
  });

  it("switches filter and keeps it in the address", async () => {
    await open(work("a", "terkirim", 1), work("b", "diterima", 2));
    await screen.findByRole("table");
    fireEvent.click(chip(/Selesai/));
    expect(titles()).toEqual(["Karya b"]);
    expect(window.location.search).toBe("?status=selesai");
    fireEvent.click(chip(/Perlu tindakan/));
    expect(window.location.search).toBe("");
  });

  it("starts on the filter named in the address", async () => {
    window.history.replaceState(null, "", "/kelola/editor?status=semua");
    await open(work("a", "terkirim", 1), work("b", "diterima", 2));
    await screen.findByRole("table");
    expect(titles()).toHaveLength(2);
  });

  it("says nothing waits, and offers to see everything when other work exists", async () => {
    await open(work("b", "diterima", 2));
    expect(await screen.findByText("Tidak ada karya yang menunggu tindakanmu.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lihat semua karya" }));
    expect(titles()).toEqual(["Karya b"]);
  });

  it("shows an empty queue without a dead button when nothing was ever sent", async () => {
    await open();
    expect(await screen.findByText("Tidak ada karya yang menunggu tindakanmu.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Lihat semua karya" })).toBeNull();
  });

  it("hides work of projects the Editor is not assigned to, and of Lomba", async () => {
    await open(
      work("a", "terkirim", 1),
      work("x", "terkirim", 2, { slug: "antologi-puisi-tengah-malam" }),
      work("y", "terkirim", 3, { slug: "lomba-esai-literasi-remaja" }),
    );
    await screen.findByRole("table");
    expect(titles()).toEqual(["Karya a"]);
  });

  it("copes with a very long title and a huge word count", async () => {
    const long = "Judul yang sangat panjang ".repeat(12);
    await open(
      work("a", "terkirim", 1, {
        title: long,
        versions: [{ ...submission().versions[0], wordCount: 1_234_567 }],
      }),
    );
    expect(await screen.findByText(long.trim())).toBeTruthy();
    expect(screen.getByText("1.234.567 kata")).toBeTruthy();
  });

  it("explains a failed read and retries", async () => {
    let fail = true;
    const base = createMemorySubmissionStore();
    await base.add(work("a", "terkirim", 1), 9);
    const store: SubmissionStore = {
      ...base,
      list: () => (fail ? Promise.reject(new Error("idb")) : base.list()),
    };
    render(<QueueView store={store} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fail = false;
    await act(async () => screen.getByRole("button", { name: "Coba lagi" }).click());
    expect(await screen.findByRole("link", { name: "Karya a" })).toBeTruthy();
  });
});
