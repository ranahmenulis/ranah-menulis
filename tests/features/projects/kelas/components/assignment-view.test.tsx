import {
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AssignmentView } from "@/features/projects/kelas/components/assignment-view";
import { reviewAssignment } from "@/features/projects/kelas/assignment-actions";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { docs, documentsOf, register } from "../../components/submit-helpers";
import { CERPEN, handedIn, PUISI } from "../helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

async function open(
  slug: string,
  id: string,
  store: AssignmentStore = createMemoryAssignmentStore(),
) {
  render(<AssignmentView slug={slug} id={id} store={store} documents={documentsOf(docs)} />);
  await screen.findByRole("heading", { level: 1 });
  return store;
}

const dashboardLink = () => screen.getByRole("link", { name: /Dasbor kelas/ });
const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

describe("assignment page", () => {
  beforeEach(() => register(CERPEN));

  it("shows the instructions, the deadline and a way back to the dashboard", async () => {
    await open(CERPEN, "tugas-2");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Profil singkat tokoh utama",
    );
    expect(screen.getByText(/Tulis satu halaman tentang tokoh utamamu/)).toBeTruthy();
    expect(screen.getByText(/^Tenggat /)).toBeTruthy();
    expect(dashboardLink().getAttribute("href")).toBe(`/projects/${CERPEN}/dasbor`);
  });

  it("hands in typed text and shows it as handed in, with a status message", async () => {
    const store = await open(CERPEN, "tugas-2");
    fireEvent.click(screen.getByRole("radio", { name: /Ketik langsung/ }));
    fireEvent.change(screen.getByLabelText("Tugasmu"), {
      target: { value: "Tokohku bernama Rani." },
    });
    expect(screen.getByText("3 kata.")).toBeTruthy();
    press("Kumpulkan tugas");
    expect(await screen.findByText(/Tugasmu terkirim/)).toBeTruthy();
    expect(screen.getByText("Dikumpulkan", { selector: "span" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kumpulkan tugas" })).toBeNull();
    expect((await store.list())[0]).toMatchObject({ assignmentId: "tugas-2", source: "teks" });
    // The form is gone, so focus moved to the title instead of falling to the page.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 })),
    );
  });

  it("hands in a Studio document", async () => {
    const store = await open(CERPEN, "tugas-2");
    fireEvent.click(await screen.findByRole("radio", { name: /Buku yang Mengubahku/ }));
    press("Kumpulkan tugas");
    expect(await screen.findByText(/Tugasmu terkirim/)).toBeTruthy();
    expect((await store.list())[0]).toMatchObject({ source: "studio", docId: "d1" });
  });

  it("names each rule that stops it and keeps what was typed", async () => {
    await open(CERPEN, "tugas-2");
    press("Kumpulkan tugas");
    expect(await screen.findByText("Pilih dokumen dari Studio.")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Ketik langsung/ }));
    press("Kumpulkan tugas");
    expect(await screen.findByText("Tulis tugasmu dulu.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Tugasmu"), { target: { value: "Sebagian." } });
    expect((screen.getByLabelText("Tugasmu") as HTMLTextAreaElement).value).toBe("Sebagian.");
  });

  it("accepts a hand-in after the deadline and says it will be marked late", async () => {
    const store = await open(CERPEN, "tugas-1");
    expect(screen.getByText(/Tenggat sudah lewat. Tugasmu tetap diterima/)).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Ketik langsung/ }));
    fireEvent.change(screen.getByLabelText("Tugasmu"), {
      target: { value: "Terlambat tapi ada." },
    });
    press("Kumpulkan tugas");
    expect(await screen.findByText(/Tugasmu terkirim/)).toBeTruthy();
    expect((await store.list())[0].late).toBe(true);
  });

  it("shows the mentor's note on a repair and takes a new version", async () => {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ id: "a1", assignmentId: "tugas-2" }));
    await reviewAssignment(store, "a1", "perlu-perbaikan", "Perjelas tokohnya.");
    await open(CERPEN, "tugas-2", store);
    expect(await screen.findByText("Perjelas tokohnya.", { selector: "p" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Kumpulkan perbaikan" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Ketik langsung/ }));
    fireEvent.change(screen.getByLabelText("Tugasmu"), {
      target: { value: "Rani, anak pertama." },
    });
    press("Kumpulkan perbaikan");
    expect(await screen.findByText(/Perbaikanmu terkirim/)).toBeTruthy();
    expect(screen.getByText("Versi 2")).toBeTruthy();
    expect(screen.getByText("Versi 1")).toBeTruthy();
  });

  it("lets the development panel play the mentor, then shows the decision", async () => {
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ id: "a1", assignmentId: "tugas-2" }));
    await open(CERPEN, "tugas-2", store);
    const panel = await screen.findByRole("complementary", {
      name: /Mentor, hanya untuk pengembangan/,
    });
    fireEvent.click(within(panel).getByRole("button", { name: "Tandai selesai" }));
    expect(await screen.findByText("Mentor menandai tugas ini selesai.")).toBeTruthy();
    expect(screen.queryByRole("complementary", { name: /Mentor/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Kumpulkan/ })).toBeNull();
  });

  it("says an unknown task is not in this class, with the way back", async () => {
    render(
      <AssignmentView
        slug={CERPEN}
        id="nope"
        store={createMemoryAssignmentStore()}
        documents={documentsOf(docs)}
      />,
    );
    expect(await screen.findByText("Tugas ini tidak ditemukan di kelas ini.")).toBeTruthy();
    expect(dashboardLink()).toBeTruthy();
  });
});

describe("assignment page when it cannot be used", () => {
  it("names why it is closed even when the Studio documents cannot be read", async () => {
    render(
      <AssignmentView
        slug={CERPEN}
        id="tugas-1"
        store={createMemoryAssignmentStore()}
        documents={
          { ...documentsOf(docs), list: () => Promise.reject(new Error("blocked")) } as never
        }
      />,
    );
    expect(await screen.findByText(/Daftar dulu untuk masuk/)).toBeTruthy();
    expect(screen.queryByText(/tidak terbaca/)).toBeNull();
  });

  it("keeps the form shut before the class starts, but shows the instructions", async () => {
    register(PUISI);
    await open(PUISI, "tugas-1");
    expect(screen.getByText(/Tugas dibuka saat kelas dimulai pada/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Kumpulkan/ })).toBeNull();
    expect(screen.getByText(/Tulis puisi empat larik/)).toBeTruthy();
  });

  it("is closed to a guest and to someone who has not registered", async () => {
    await open(CERPEN, "tugas-1");
    expect(screen.getByText(/Daftar dulu untuk masuk/)).toBeTruthy();
    cleanup();
    sessionStorage.setItem("rm-viewer", "tamu");
    await open(CERPEN, "tugas-1");
    expect(screen.getByText("Masuk untuk membuka dasbor kelas.")).toBeTruthy();
  });
});
