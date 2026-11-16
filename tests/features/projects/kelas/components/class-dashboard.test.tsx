import { act, cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ClassDashboard } from "@/features/projects/kelas/components/class-dashboard";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { register } from "../../components/submit-helpers";
import { CERPEN, handedIn, PUISI } from "../helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

async function open(slug: string, store: AssignmentStore = createMemoryAssignmentStore()) {
  render(<ClassDashboard slug={slug} store={store} />);
  await screen.findByRole("heading", { level: 1 });
  return store;
}

const back = () => screen.getByRole("link", { name: /Kembali ke proyek/ });

describe("class dashboard of a running class", () => {
  beforeEach(() => register(CERPEN));

  it("shows the class, a way back, the next meeting and where you stand", async () => {
    await open(CERPEN);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Kelas Cerpen untuk Pemula");
    expect(back().getAttribute("href")).toBe(`/projects/${CERPEN}`);
    expect(screen.getByText("Mentor: Bagas Wirawan")).toBeTruthy();
    expect(screen.getByText("Pertemuan berikutnya")).toBeTruthy();
    expect(screen.getByText("Tokoh dan keinginannya", { selector: "p" })).toBeTruthy();
    const bar = screen.getByRole("progressbar", { name: "Progres belajar" });
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(screen.queryByText(/Kelas belum dimulai/)).toBeNull();
  });

  it("lists every assignment as a link to its own page, with where it stands", async () => {
    await open(CERPEN);
    const tasks = screen.getByRole("heading", { name: "Tugas" }).closest("section")!;
    const link = within(tasks).getByRole("link", { name: "Kerangka cerpenmu" });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/tugas/tugas-1`);
    expect(within(tasks).getAllByRole("listitem")).toHaveLength(4);
    // The first deadline is already behind; the others are still open.
    expect(within(tasks).getByText("Lewat tenggat")).toBeTruthy();
    expect(within(tasks).getAllByText("Belum dikumpulkan")).toHaveLength(3);
  });

  it("counts a material once it is marked done, and keeps it", async () => {
    await open(CERPEN);
    const material = screen.getByText("Satu ide, satu pertanyaan").closest("details")!;
    fireEvent.click(within(material).getByRole("checkbox", { name: "Tandai selesai" }));
    expect(
      screen.getByRole("progressbar", { name: "Progres belajar" }).getAttribute("aria-valuenow"),
    ).toBe("10");
    expect(within(material).getByText("Selesai")).toBeTruthy();
    cleanup();
    await open(CERPEN);
    expect(
      screen.getByRole("progressbar", { name: "Progres belajar" }).getAttribute("aria-valuenow"),
    ).toBe("10");
  });

  it("counts an assignment only once the mentor marked it Selesai", async () => {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ status: "dikumpulkan" }));
    await store.add(handedIn({ id: "a2", assignmentId: "tugas-2", status: "selesai" }));
    await open(CERPEN, store);
    await screen.findByText("Dikumpulkan");
    expect(
      screen.getByRole("progressbar", { name: "Progres belajar" }).getAttribute("aria-valuenow"),
    ).toBe("10");
    expect(screen.getByText("Selesai", { selector: "span" })).toBeTruthy();
  });

  it("marks a late hand-in without calling it a failure", async () => {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ late: true }));
    await open(CERPEN, store);
    expect(await screen.findByText(/Dikumpulkan terlambat/)).toBeTruthy();
  });

  it("opens an outside link in a new tab and names it", async () => {
    await open(CERPEN);
    const link = screen.getByRole("link", { name: /Buka tautan pertemuan/ });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("class dashboard before the class starts", () => {
  it("shows the schedule and the assignments, but keeps the materials shut", async () => {
    register(PUISI);
    await open(PUISI);
    expect(screen.getByText(/Kelas belum dimulai/)).toBeTruthy();
    expect(screen.getByText(/Materi dibuka saat kelas dimulai/)).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getAllByText("Belum dibuka")).toHaveLength(4);
    expect(screen.getByText("Pertemuan berikutnya")).toBeTruthy();
  });
});

describe("class dashboard when it cannot open", () => {
  it("asks a guest to sign in", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    await open(CERPEN);
    expect(screen.getByText("Masuk untuk membuka dasbor kelas.")).toBeTruthy();
    expect(back().getAttribute("href")).toBe(`/projects/${CERPEN}`);
  });

  it("offers registering to someone who has not registered", async () => {
    await open(CERPEN);
    expect(screen.getByText(/Daftar dulu untuk masuk/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Daftar" }).getAttribute("href")).toBe(
      `/projects/${CERPEN}/daftar`,
    );
  });

  it("explains a payment that is still pending", async () => {
    register(PUISI, { status: "menunggu-pembayaran" });
    await open(PUISI);
    expect(screen.getByText(/setelah pembayaranmu dikonfirmasi/)).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("says a project that is not a class has no class dashboard", async () => {
    register("solo-penerbitan-buku-sendiri");
    await open("solo-penerbitan-buku-sendiri");
    expect(screen.getByText(/bukan kelas/)).toBeTruthy();
    expect(back()).toBeTruthy();
  });

  it("says not found for an address that matches nothing", async () => {
    render(<ClassDashboard slug="tidak-ada" store={createMemoryAssignmentStore()} />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
  });

  it("shows a failed read as an error with a retry, never as nothing handed in", async () => {
    register(CERPEN);
    const store = createMemoryAssignmentStore();
    let fail = true;
    const list = store.list.bind(store);
    store.list = () => (fail ? Promise.reject(new Error("blocked")) : list());
    render(<ClassDashboard slug={CERPEN} store={store} />);
    expect(await screen.findByText(/Data di perangkat ini tidak terbaca/)).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    fail = false;
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Coba lagi/ })));
    expect(await screen.findByRole("progressbar", { name: "Progres belajar" })).toBeTruthy();
  });
});
