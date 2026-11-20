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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: vi.fn() }),
}));

const files = vi.hoisted(() => ({
  current: null as null | import("@/lib/files/file-store").FileStore,
}));
vi.mock("@/lib/files/store", () => ({ fileStore: () => files.current }));

import { createMemoryFileStore } from "@/lib/files/memory-file-store";
import { ManageView } from "@/features/kelola/organizer/components/manage-view";
import { parseOverrides } from "@/features/projects/lomba/stage-store";
import { createMemorySoloStore } from "@/features/projects/solo/storage/memory-solo-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { installDialogShim } from "@/test/dialog-shim";
import { submission } from "../../projects/helpers";
import { ID, SOLO } from "../../projects/solo/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const OPEN = "lomba-cerpen-hujan-2026";
const DONE = "lomba-cerita-mini-pesisir-2026";
const ANTOLOGI = "antologi-pulang-ke-pesisir";

beforeEach(() => {
  files.current = createMemoryFileStore();
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("rm-roles", "organizer");
});
afterEach(cleanup);

const accepted = (over: Partial<Submission> = {}) =>
  submission({
    id: ID,
    slug: SOLO,
    title: "Buku Pertamaku",
    packageName: "Terbit dan Produksi",
    status: "diterima",
    ...over,
  });

async function openSolo(works: Submission[]) {
  const submissions = createMemorySubmissionStore();
  for (const w of works) await submissions.add(w, 5);
  const solo = createMemorySoloStore();
  window.history.replaceState(null, "", `/kelola/organizer/${SOLO}?tab=tahap`);
  render(<ManageView slug={SOLO} store={submissions} soloStore={solo} />);
  return solo;
}

function openContest(slug: string) {
  window.history.replaceState(null, "", `/kelola/organizer/${slug}?tab=tahap`);
  render(<ManageView slug={slug} store={createMemorySubmissionStore()} />);
}

describe("the Tahap tab", () => {
  it("exists for Solo and Lomba and not for an Antologi", async () => {
    window.history.replaceState(null, "", `/kelola/organizer/${ANTOLOGI}`);
    render(<ManageView slug={ANTOLOGI} store={createMemorySubmissionStore()} />);
    await screen.findByRole("link", { name: "Peserta" });
    expect(screen.queryByRole("link", { name: "Tahap" })).toBeNull();
    cleanup();
    openContest(OPEN);
    expect(await screen.findByRole("link", { name: "Tahap" })).toBeTruthy();
  });
});

describe("Solo stages", () => {
  it("says what to do when no manuscript was accepted yet", async () => {
    await openSolo([]);
    expect(await screen.findByText(/Belum ada naskah yang diterima/)).toBeTruthy();
  });

  it("does not list a manuscript that is still under review", async () => {
    await openSolo([accepted({ status: "peninjauan" })]);
    expect(await screen.findByText(/Belum ada naskah yang diterima/)).toBeTruthy();
  });

  it("moves an accepted book one stage on after asking, and says so", async () => {
    const solo = await openSolo([accepted()]);
    const list = await screen.findByRole("list", { name: "Buku dalam penerbitan" });
    expect(within(list).getByText(/tahap penyuntingan/)).toBeTruthy();
    fireEvent.click(within(list).getByRole("button", { name: /^Lanjut ke/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Lanjutkan" }));
    expect(
      await screen.findByText(/“Buku Pertamaku” sekarang di tahap proofreading/i),
    ).toBeTruthy();
    expect((await solo.list())[0].log.at(-1)).toMatchObject({ kind: "lanjut", by: "organizer" });
  });

  it("adds a preview the package promises, once", async () => {
    const solo = await openSolo([accepted()]);
    fireEvent.click(await screen.findByRole("button", { name: "Tambah pratinjau sampul" }));
    const dialog = await screen.findByRole("dialog");
    const add = within(dialog).getByRole("button", { name: "Tambahkan" }) as HTMLButtonElement;
    // A preview needs its file: nothing can be added before one is picked.
    expect(add.disabled).toBe(true);
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    fireEvent.change(within(dialog).getByLabelText("Pilih berkas pratinjau sampul"), {
      target: { files: [new File([png], "sampul-v1.png")] },
    });
    await waitFor(() => expect(add.disabled).toBe(false));
    fireEvent.click(add);
    expect(await screen.findByText(/Pratinjau sampul ditambahkan/)).toBeTruthy();
    const [row] = await solo.list();
    expect(row.files).toHaveLength(1);
    expect(row.files[0]).toMatchObject({ fileName: "sampul-v1.png", fileType: "image/png" });
    expect(await files.current!.get(row.files[0].fileId!)).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Tambah pratinjau sampul" })).toBeNull();
  });

  it("explains a failed read and retries instead of showing no books", async () => {
    const submissions = createMemorySubmissionStore();
    await submissions.add(accepted(), 5);
    const solo = createMemorySoloStore();
    const list = vi.spyOn(solo, "list").mockRejectedValueOnce(new Error("boom"));
    window.history.replaceState(null, "", `/kelola/organizer/${SOLO}?tab=tahap`);
    render(<ManageView slug={SOLO} store={submissions} soloStore={solo} />);
    expect(await screen.findByText(/belum bisa dibuka karena data/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Coba lagi/ }));
    expect(await screen.findByRole("list", { name: "Buku dalam penerbitan" })).toBeTruthy();
    expect(list).toHaveBeenCalled();
  });
});

describe("contest stages", () => {
  it("shows where the contest stands and offers only the steps ahead", async () => {
    openContest(OPEN);
    expect(await screen.findByText("Penerimaan karya")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tutup penerimaan, mulai dinilai" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Umumkan finalis" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Umumkan pemenang" })).toBeTruthy();
  });

  it("warns that an announcement is final, pushes the stage and drops the steps behind it", async () => {
    openContest(OPEN);
    fireEvent.click(await screen.findByRole("button", { name: "Umumkan finalis" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(/tidak bisa ditarik kembali/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Umumkan finalis" }));
    expect(await screen.findByText("Umumkan finalis: selesai.")).toBeTruthy();
    expect(screen.getByText("Finalis diumumkan")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tutup penerimaan, mulai dinilai" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Umumkan finalis" })).toBeNull();
    expect(parseOverrides(localStorage.getItem("ranah.contestStages"))[OPEN].stage).toBe("finalis");
  });

  it("has nothing left to do once the winners were announced", async () => {
    openContest(DONE);
    expect((await screen.findAllByText(/Pemenang sudah diumumkan/)).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Umumkan/ })).toBeNull();
  });

  it("keeps focus on the result line after the button disappears", async () => {
    openContest(OPEN);
    fireEvent.click(await screen.findByRole("button", { name: "Umumkan pemenang" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Umumkan pemenang" }));
    await screen.findByText("Umumkan pemenang: selesai.");
    await act(async () => new Promise<void>((r) => requestAnimationFrame(() => r())));
    expect(document.activeElement?.getAttribute("role")).toBe("status");
  });
});
