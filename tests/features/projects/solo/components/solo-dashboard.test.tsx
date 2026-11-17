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
import { SoloDashboard } from "@/features/projects/solo/components/solo-dashboard";
import { advanceStage } from "@/features/projects/solo/solo-actions";
import { createMemorySoloStore } from "@/features/projects/solo/storage/memory-solo-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { installDialogShim } from "@/test/dialog-shim";
import { register } from "../../components/submit-helpers";
import { NOW, submission } from "../../helpers";
import { BASE, FULL, ID, SOLO, walked, withPreviews } from "../helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

const accepted = (over: Partial<Submission> = {}) =>
  submission({
    id: ID,
    slug: SOLO,
    title: "Buku Pertamaku",
    packageName: "Terbit dan Produksi",
    status: "diterima",
    statusLog: [
      { status: "terkirim", at: NOW - 5000, by: "sistem" },
      { status: "diterima", at: NOW - 2000, by: "editor" },
    ],
    submittedAt: NOW - 5000,
    ...over,
  });

async function open(work?: Submission, progress?: Awaited<ReturnType<typeof walked>>) {
  register(SOLO, { packageName: "Terbit dan Produksi" });
  const submissions = createMemorySubmissionStore();
  if (work) await submissions.add(work, 1);
  const store = createMemorySoloStore();
  if (progress) await store.add(progress);
  render(<SoloDashboard slug={SOLO} submissions={submissions} store={store} />);
  await screen.findByRole("heading", { level: 1 });
  return store;
}

const stageNames = () =>
  within(screen.getByRole("heading", { name: "Tahap penerbitan" }).closest("section")!)
    .getAllByRole("listitem")
    .map((li) => li.textContent);

describe("Solo dashboard", () => {
  it("asks for the manuscript when none was sent, with a way back", async () => {
    await open();
    expect(screen.getByRole("link", { name: /Kembali ke proyek/ }).getAttribute("href")).toBe(
      `/projects/${SOLO}`,
    );
    expect(screen.getByRole("link", { name: "Kirim naskah" }).getAttribute("href")).toContain(
      "/kirim",
    );
    expect(stageNames()[0]).toContain("Sedang berjalan");
    expect(screen.queryByRole("heading", { name: "Persetujuan final" })).toBeNull();
  });

  it("says the submission is being reviewed and keeps the other stages waiting", async () => {
    await open(accepted({ status: "peninjauan" }));
    expect(screen.getByText(/Pengajuanmu sedang ditinjau/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat pengajuan" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Berkas pratinjau" })).toBeNull();
    expect(
      stageNames()
        .slice(1)
        .every((t) => t?.includes("Belum dimulai")),
    ).toBe(true);
  });

  it("shows the reason when the submission was turned down, and no stages", async () => {
    await open(
      accepted({
        status: "ditolak",
        statusLog: [{ status: "ditolak", at: NOW, by: "editor", reason: "Naskah belum utuh." }],
      }),
    );
    expect(screen.getByText(/Naskah belum utuh\./)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Tahap penerbitan" })).toBeNull();
  });

  it("lists every stage of the package once accepted, the first one running", async () => {
    await open(accepted());
    expect(stageNames()).toHaveLength(8);
    expect(stageNames()[1]).toContain("Sedang berjalan");
    expect(screen.getByRole("heading", { name: "Berkas pratinjau" })).toBeTruthy();
    expect(screen.getByText(/Belum ada berkas/)).toBeTruthy();
  });

  it("shows only the stages of a smaller package", async () => {
    register(SOLO, { packageName: "Naskah Siap Terbit" });
    const submissions = createMemorySubmissionStore();
    await submissions.add(accepted({ packageName: "Naskah Siap Terbit" }), 1);
    render(<SoloDashboard slug={SOLO} submissions={submissions} store={createMemorySoloStore()} />);
    await screen.findByRole("heading", { level: 1 });
    expect(stageNames()).toHaveLength(4);
    expect(screen.queryByRole("heading", { name: "Berkas pratinjau" })).toBeNull();
  });

  it("moves when the team moves it and then offers the final approval", async () => {
    const store = await open(accepted(), walked(FULL, "layout"));
    await act(async () => {
      await advanceStage(store, { ...BASE, stages: FULL });
    });
    await screen.findByRole("heading", { name: "Persetujuan final" });
    expect(stageNames()[5]).toContain("Sedang berjalan");
    expect((await store.list())[0].log.at(-1)?.stage).toBe("persetujuan-final");
  });

  it("asks for changes with a note, and the book goes back to the layout", async () => {
    await open(accepted(), withPreviews(walked(FULL, "persetujuan-final")));
    fireEvent.click(screen.getByRole("button", { name: "Minta perubahan" }));
    fireEvent.click(screen.getByRole("button", { name: "Kirim permintaan" }));
    expect(screen.getByText("Tulis perubahan yang kamu minta.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Perubahan yang diminta"), {
      target: { value: "Margin terlalu sempit" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim permintaan" }));
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Persetujuan final" })).toBeNull(),
    );
    expect(stageNames()[4]).toContain("Sedang berjalan");
    await waitFor(() => expect(document.activeElement?.tagName).toBe("H1"));
  });

  it("approves only after the warning, then production runs and the decision is shown", async () => {
    await open(accepted(), withPreviews(walked(FULL, "persetujuan-final")));
    fireEvent.click(screen.getByRole("button", { name: "Setujui" }));
    expect(screen.getByText(/Setelah disetujui, bukumu masuk produksi/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Setujui dan mulai produksi" }));
    await screen.findByText(/Kamu menyetujui versi final/);
    expect(screen.queryByRole("button", { name: "Setujui" })).toBeNull();
    expect(stageNames()[6]).toContain("Sedang berjalan");
  });

  it("offers only approving once the two rounds of changes are used", async () => {
    const at = walked(FULL, "persetujuan-final");
    const row = {
      ...at,
      log: [
        ...at.log,
        {
          kind: "minta-perubahan" as const,
          stage: "layout" as const,
          at: 3000,
          by: "penulis" as const,
          note: "Satu",
        },
        {
          kind: "lanjut" as const,
          stage: "persetujuan-final" as const,
          at: 3001,
          by: "organizer" as const,
        },
        {
          kind: "minta-perubahan" as const,
          stage: "layout" as const,
          at: 3002,
          by: "penulis" as const,
          note: "Dua",
        },
        {
          kind: "lanjut" as const,
          stage: "persetujuan-final" as const,
          at: 3003,
          by: "organizer" as const,
        },
      ],
    };
    await open(accepted(), { ...row, ...BASE });
    expect(screen.getByText(/Jatah permintaan perubahan sudah habis/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Minta perubahan" })).toBeNull();
    expect(screen.getByText("Satu")).toBeTruthy();
  });

  it("keeps both decisions shut until the previews are there", async () => {
    await open(accepted(), walked(FULL, "persetujuan-final"));
    expect(screen.getByText(/Tim belum mengunggah semua pratinjau/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Setujui" }).hasAttribute("disabled")).toBe(true);
  });

  it("points a revision request to the revision page", async () => {
    await open(accepted({ status: "perlu-revisi" }));
    expect(screen.getByRole("link", { name: "Kirim revisi" }).getAttribute("href")).toContain(
      "/revisi",
    );
  });
});
