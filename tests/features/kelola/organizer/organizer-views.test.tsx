import {
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push }),
}));

import { reviewAccess } from "@/features/kelola/editor/assignments";
import { ManageView } from "@/features/kelola/organizer/components/manage-view";
import { NewProjectView } from "@/features/kelola/organizer/components/new-project-view";
import { OrganizerView } from "@/features/kelola/organizer/components/organizer-view";
import { ME_ID } from "@/features/kelola/identity";
import { staffAssignments } from "@/features/kelola/staff-assignments";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { storedProjects } from "@/features/projects/stored-projects";
import { installDialogShim } from "@/test/dialog-shim";
import { registration } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const store = () => createMemorySubmissionStore();
const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  storedProjects.reset();
  staffAssignments.reset();
  push.mockClear();
  sessionStorage.setItem("rm-roles", "organizer");
  window.history.replaceState(null, "", "/kelola/organizer");
});
afterEach(cleanup);

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/** Fills the Antologi form with a valid project and presses the button. */
function writeProject(title = "Antologi Hujan") {
  fill("Judul", title);
  fill("Ringkasan", "Cerita tentang hujan.");
  fill("Deskripsi", "Paragraf satu.");
  fill("Syarat naskah", "Satu karya per penulis.");
  fill("Tenggat pendaftaran", day(20));
  fill("Kata minimum", "500");
  fill("Kata maksimum", "2000");
  fill("Tema", "Hujan");
  fill("Tahap", "Pendaftaran\nSeleksi");
  fireEvent.click(screen.getByRole("button", { name: "Buat draf" }));
}

describe("OrganizerView", () => {
  it("lists the sample projects as active, marked as samples", async () => {
    render(<OrganizerView store={store()} />);
    const list = await screen.findByRole("list", { name: "Daftar proyek" });
    expect(within(list).getAllByRole("link").length).toBe(projectFixtures.length);
    expect(within(list).getAllByText(/Proyek contoh/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Buat proyek" }).getAttribute("href")).toBe(
      "/kelola/organizer/baru",
    );
  });

  it("filters by status and offers a way back from an empty filter", async () => {
    render(<OrganizerView store={store()} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Diarsipkan/ }));
    expect(screen.getByText("Belum ada proyek yang diarsipkan.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lihat proyek aktif" }));
    expect(await screen.findByRole("list", { name: "Daftar proyek" })).toBeTruthy();
  });

  it("lists written projects too, and shows nothing to a viewer who is not an Organizer", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    render(<OrganizerView store={store()} />);
    expect(await screen.findByText("Belum ada proyek. Buat proyek pertamamu.")).toBeTruthy();
  });
});

describe("NewProjectView", () => {
  it("names every missing rule and keeps what was typed", () => {
    render(<NewProjectView />);
    fill("Judul", "Antologi Hujan");
    fireEvent.click(screen.getByRole("button", { name: "Buat draf" }));
    expect(screen.getByText("Tulis satu kalimat ringkasan untuk katalog.")).toBeTruthy();
    expect(screen.getByText("Pilih tanggal tenggat pendaftaran.")).toBeTruthy();
    expect((screen.getByLabelText("Judul") as HTMLInputElement).value).toBe("Antologi Hujan");
    expect(storedProjects.read()).toHaveLength(0);
    expect(push).not.toHaveBeenCalled();
  });

  it("saves a draft and opens it", () => {
    render(<NewProjectView />);
    writeProject();
    const [project] = storedProjects.read();
    expect(project).toMatchObject({ slug: "antologi-antologi-hujan", publication: "draf" });
    expect(push).toHaveBeenCalledWith("/kelola/organizer/antologi-antologi-hujan");
  });

  it("shows the fields of the chosen category", () => {
    render(<NewProjectView />);
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "lomba" } });
    expect(screen.getByLabelText("Kriteria penilaian")).toBeTruthy();
    expect(screen.queryByLabelText("Tema")).toBeNull();
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "solo" } });
    expect(screen.getByLabelText("Paket")).toBeTruthy();
    expect(screen.queryByLabelText("Tenggat pendaftaran")).toBeNull();
  });
});

async function openDraft() {
  const { unmount } = render(<NewProjectView />);
  writeProject();
  unmount();
  cleanup();
  const [project] = storedProjects.read();
  window.history.replaceState(null, "", `/kelola/organizer/${project.slug}`);
  render(<ManageView slug={project.slug} store={store()} />);
  return project.slug;
}

describe("ManageView", () => {
  it("publishes a draft after confirming, then offers closing", async () => {
    await openDraft();
    fireEvent.click(await screen.findByRole("button", { name: "Terbitkan" }));
    const dialog = await screen.findByRole("dialog", { name: "Terbitkan proyek ini?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Terbitkan" }));
    expect(await screen.findByText("Terbitkan: selesai.")).toBeTruthy();
    expect(storedProjects.read()[0].publication).toBe("terbit");
    expect(screen.getByRole("button", { name: "Tutup pendaftaran" })).toBeTruthy();
  });

  it("deletes a draft nobody joined and leaves for the list", async () => {
    await openDraft();
    fireEvent.click(await screen.findByRole("button", { name: "Hapus draf" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus draf" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/kelola/organizer"));
    expect(storedProjects.read()).toHaveLength(0);
  });

  it("refuses to delete a draft that got a registration meanwhile", async () => {
    const slug = await openDraft();
    fireEvent.click(await screen.findByRole("button", { name: "Hapus draf" }));
    const dialog = await screen.findByRole("alertdialog");
    localStorage.setItem(
      "ranah.registrations",
      JSON.stringify({ [slug]: registration(slug, { status: "terdaftar" }) }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus draf" }));
    expect(await screen.findByText(/Sudah ada peserta/)).toBeTruthy();
    expect(storedProjects.read()).toHaveLength(1);
  });

  it("archives and ends the Editor's access", async () => {
    const slug = await openDraft();
    staffAssignments.write([{ slug, role: "editor", staffId: ME_ID }]);
    expect(reviewAccess(["editor"], slug, storedProjects.read(), staffAssignments.read())).toBe(
      "ok",
    );
    fireEvent.click(await screen.findByRole("button", { name: "Arsipkan" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Arsipkan" }));
    expect(await screen.findByText("Arsipkan: selesai.")).toBeTruthy();
    expect(reviewAccess(["editor"], slug, storedProjects.read(), staffAssignments.read())).toBe(
      "tidak-ditugaskan",
    );
    expect(
      await screen.findByText("Proyek ini diarsipkan dan tidak bisa diubah lagi."),
    ).toBeTruthy();
  });

  it("assigns an Editor and takes the assignment back, saying so", async () => {
    const slug = "antologi-surat-yang-tidak-pernah-terkirim";
    window.history.replaceState(null, "", `/kelola/organizer/${slug}?tab=penugasan`);
    render(<ManageView slug={slug} store={store()} />);
    const own = await screen.findByRole("checkbox", { name: "Rinjani Putri (kamu)" });
    expect((own as HTMLInputElement).checked).toBe(true);
    fireEvent.click(own);
    expect(await screen.findByText("Rinjani Putri (kamu) tidak lagi ditugaskan.")).toBeTruthy();
    expect(reviewAccess(["editor"], slug, undefined, staffAssignments.read())).toBe(
      "tidak-ditugaskan",
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Hafiz Rahman" }));
    expect(await screen.findByText("Hafiz Rahman ditugaskan.")).toBeTruthy();
  });

  it("says a sample project cannot be changed, and says nobody joined", async () => {
    const slug = "antologi-surat-yang-tidak-pernah-terkirim";
    window.history.replaceState(null, "", `/kelola/organizer/${slug}`);
    render(<ManageView slug={slug} store={store()} />);
    expect(await screen.findByText(/Ini proyek contoh dan tidak bisa diubah/)).toBeTruthy();
  });

  it("is not shown to an Organizer for a project owned by someone else", async () => {
    storedProjects.write([
      {
        ...projectFixtures[0],
        slug: "milik-lain",
        ownerId: "organizer-lain",
        absolute: { closesAt: null, milestones: [] },
      },
    ]);
    render(<ManageView slug="milik-lain" store={store()} />);
    expect(await screen.findByText("Proyek ini bukan milikmu.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke daftar proyek" })).toBeTruthy();
  });

  it("says when the project does not exist", async () => {
    render(<ManageView slug="tidak-ada" store={store()} />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
  });

  it("locks prices and keeps the quota above those who joined", async () => {
    const slug = await openDraft();
    localStorage.setItem(
      "ranah.registrations",
      JSON.stringify({ [slug]: registration(slug, { status: "terdaftar" }) }),
    );
    expect(await screen.findByText(/Sudah ada 1 peserta/)).toBeTruthy();
    expect((screen.getByLabelText("Zona waktu") as HTMLSelectElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/^Kuota/), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(storedProjects.read()[0].quota).toMatchObject({ total: 1 });
  });
});
