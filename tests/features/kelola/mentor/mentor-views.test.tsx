import { textOf } from "@/features/notifications/notification-text";
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
}));

import { MentorClassView } from "@/features/kelola/mentor/components/mentor-class-view";
import { MentorClassesView } from "@/features/kelola/mentor/components/mentor-classes-view";
import { MentorReviewView } from "@/features/kelola/mentor/components/mentor-review-view";
import { assignmentNotifications } from "@/features/projects/kelas/assignment-notifications";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { notifyAssignmentsChanged } from "@/features/projects/kelas/storage/assignment-events";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { installDialogShim } from "@/test/dialog-shim";
import { register } from "../../projects/components/submit-helpers";
import { CERPEN, DAY, PUISI, handedIn } from "../../projects/kelas/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("rm-roles", "mentor");
  window.history.replaceState(null, "", "/kelola/mentor");
});
afterEach(cleanup);

async function storeWith(...works: ReturnType<typeof handedIn>[]) {
  const store = createMemoryAssignmentStore();
  for (const work of works) await store.add(work);
  return store;
}

/** A coming day, as the date field writes it. */
const inDays = (n: number) => new Date(Date.now() + n * DAY).toISOString().slice(0, 10);

describe("MentorClassesView", () => {
  it("lists the assigned class with how many hand-ins wait, and not the others", async () => {
    render(<MentorClassesView store={await storeWith(handedIn())} />);
    const link = await screen.findByRole("link", { name: /Kelas Cerpen untuk Pemula/ });
    expect(link.getAttribute("href")).toBe(`/kelola/mentor/${CERPEN}`);
    expect(within(link).getByText("1 menunggu penilaianmu")).toBeTruthy();
    expect(screen.queryByText(/Menulis Puisi/)).toBeNull();
  });

  it("says nothing waits when nothing was handed in", async () => {
    render(<MentorClassesView store={await storeWith()} />);
    expect(await screen.findByText("Tidak ada yang menunggu penilaianmu")).toBeTruthy();
  });

  it("shows an empty state to someone with no class assigned", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    render(<MentorClassesView store={await storeWith()} />);
    expect(await screen.findByText("Belum ada kelas yang ditugaskan kepadamu.")).toBeTruthy();
  });

  it("lists every class for an Administrator", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    render(<MentorClassesView store={await storeWith()} />);
    expect(await screen.findByRole("link", { name: /Menulis Puisi/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Cerpen untuk Pemula/ })).toBeTruthy();
  });

  it("explains a failed read and retries", async () => {
    let fail = true;
    const base = await storeWith();
    const store: AssignmentStore = {
      ...base,
      list: () => (fail ? Promise.reject(new Error("idb")) : base.list()),
    };
    render(<MentorClassesView store={store} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fail = false;
    await act(async () => screen.getByRole("button", { name: "Coba lagi" }).click());
    expect(await screen.findByRole("link", { name: /Cerpen untuk Pemula/ })).toBeTruthy();
  });
});

describe("MentorClassView, hand-ins", () => {
  const open = async (...works: ReturnType<typeof handedIn>[]) => {
    window.history.replaceState(null, "", `/kelola/mentor/${CERPEN}`);
    const store = await storeWith(...works);
    render(<MentorClassView slug={CERPEN} store={store} />);
    await screen.findByRole("heading", { name: "Kelas Cerpen untuk Pemula", level: 1 });
    return store;
  };

  it("opens on what needs a decision, with counts, and links each row to its page", async () => {
    await open(
      handedIn({ id: "a", assignmentId: "tugas-1" }),
      handedIn({ id: "b", assignmentId: "tugas-2", status: "selesai" }),
    );
    expect(
      screen.getByRole("button", { name: /Perlu dinilai\s*1/ }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("button", { name: /Semua\s*2/ })).toBeTruthy();
    const link = await screen.findByRole("link", { name: "Kerangka cerpenmu" });
    expect(link.getAttribute("href")).toBe(`/kelola/mentor/${CERPEN}/pengumpulan/a`);
    expect(screen.queryByRole("link", { name: "Tokoh dan keinginannya" })).toBeNull();
  });

  it("switches filter and keeps it in the address", async () => {
    await open(
      handedIn({ id: "a", assignmentId: "tugas-1" }),
      handedIn({ id: "b", assignmentId: "tugas-2", status: "selesai" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Selesai/ }));
    expect(window.location.search).toBe("?status=selesai");
    expect(within(screen.getByRole("table")).getAllByRole("link")).toHaveLength(1);
  });

  it("marks a late hand-in", async () => {
    await open(handedIn({ late: true }));
    expect(await screen.findByText("Terlambat")).toBeTruthy();
  });

  it("says nothing waits, and offers everything, when other work exists", async () => {
    await open(handedIn({ status: "selesai" }));
    expect(await screen.findByText("Tidak ada tugas yang menunggu penilaianmu.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lihat semua pengumpulan" }));
    expect(screen.getByRole("table")).toBeTruthy();
  });

  it("links the three tabs through the address", async () => {
    await open();
    const nav = screen.getByRole("navigation", { name: "Bagian kelas" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual([
      `/kelola/mentor/${CERPEN}`,
      `/kelola/mentor/${CERPEN}?tab=tugas`,
      `/kelola/mentor/${CERPEN}?tab=peserta`,
    ]);
  });
});

describe("MentorClassView, when it cannot show the class", () => {
  it("refuses a class that is not assigned, with the way back", async () => {
    render(<MentorClassView slug={PUISI} store={await storeWith()} />);
    expect(await screen.findByText("Kelas ini tidak ditugaskan kepadamu.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke daftar kelas" }).getAttribute("href")).toBe(
      "/kelola/mentor",
    );
  });

  it("says an unknown class is not found", async () => {
    render(<MentorClassView slug="nope" store={await storeWith()} />);
    expect(await screen.findByText("Kelas ini tidak ditemukan.")).toBeTruthy();
  });

  it("explains a failed read and retries", async () => {
    let fail = true;
    const base = await storeWith();
    const store: AssignmentStore = {
      ...base,
      list: () => (fail ? Promise.reject(new Error("idb")) : base.list()),
    };
    render(<MentorClassView slug={CERPEN} store={store} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fail = false;
    await act(async () => screen.getByRole("button", { name: "Coba lagi" }).click());
    expect(
      await screen.findByRole("heading", { name: /Cerpen untuk Pemula/, level: 1 }),
    ).toBeTruthy();
  });
});

describe("MentorClassView, tasks", () => {
  const open = async (...works: ReturnType<typeof handedIn>[]) => {
    window.history.replaceState(null, "", `/kelola/mentor/${CERPEN}?tab=tugas`);
    render(<MentorClassView slug={CERPEN} store={await storeWith(...works)} />);
    await screen.findByRole("button", { name: "Buat tugas" });
  };
  const write = (title: string, instructions: string, due: string) => {
    fireEvent.change(screen.getByLabelText("Judul"), { target: { value: title } });
    fireEvent.change(screen.getByLabelText("Petunjuk"), { target: { value: instructions } });
    fireEvent.change(screen.getByLabelText("Tenggat"), { target: { value: due } });
  };
  const dialog = () => screen.getByRole("dialog");

  it("lists the curriculum tasks as read-only", async () => {
    await open();
    expect(screen.getAllByText(/Dari kurikulum/)).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /^Ubah tugas/ })).toBeNull();
  });

  it("refuses an incomplete task at each field and keeps what was typed", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Buat tugas" }));
    fireEvent.change(screen.getByLabelText("Petunjuk"), { target: { value: "Tulis surat." } });
    fireEvent.click(within(dialog()).getByRole("button", { name: "Buat tugas" }));
    expect(within(dialog()).getByText("Tulis judul tugas.")).toBeTruthy();
    expect(within(dialog()).getByText("Pilih tanggal tenggat.")).toBeTruthy();
    expect((screen.getByLabelText("Petunjuk") as HTMLTextAreaElement).value).toBe("Tulis surat.");
    expect(document.activeElement).toBe(screen.getByLabelText("Judul"));
    expect(localStorage.getItem("ranah.mentorTasks")).toBeNull();
  });

  it("refuses a deadline in the past", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Buat tugas" }));
    write("Surat", "Tulis surat.", inDays(-3));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Buat tugas" }));
    expect(within(dialog()).getByText(/sudah lewat/)).toBeTruthy();
  });

  it("writes a task, announces it, and lists it as the mentor's own", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Buat tugas" }));
    write("Surat untuk tokohmu", "Tulis satu surat.\n\nMaksimal dua halaman.", inDays(5));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Buat tugas" }));
    expect(await screen.findByText("Tugas “Surat untuk tokohmu” dibuat.")).toBeTruthy();
    const row = screen.getByRole("link", { name: "Surat untuk tokohmu" }).closest("li")!;
    expect(within(row).getByText(/Tugasmu/)).toBeTruthy();
    expect(within(row).getByText(/0 pengumpulan/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("ranah.mentorTasks")!)).toHaveLength(1);
  });

  it("changes a task", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Buat tugas" }));
    write("Surat", "Tulis surat.", inDays(5));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Buat tugas" }));
    fireEvent.click(await screen.findByRole("button", { name: "Ubah tugas Surat" }));
    fireEvent.change(screen.getByLabelText("Judul"), { target: { value: "Surat panjang" } });
    fireEvent.click(within(dialog()).getByRole("button", { name: "Simpan tugas" }));
    expect(await screen.findByText("Tugas “Surat panjang” disimpan.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Surat" })).toBeNull();
  });

  it("deletes a task nobody handed in, after confirming, and returns focus to the button", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Buat tugas" }));
    write("Surat", "Tulis surat.", inDays(5));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Buat tugas" }));
    fireEvent.click(await screen.findByRole("button", { name: "Hapus tugas Surat" }));
    const confirm = await screen.findByRole("alertdialog", { name: "Hapus tugas ini?" });
    fireEvent.click(within(confirm).getByRole("button", { name: "Hapus tugas" }));
    expect(await screen.findByText("Tugas “Surat” dihapus.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Surat" })).toBeNull();
    expect(localStorage.getItem("ranah.mentorTasks")).toBe("[]");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Buat tugas" })),
    );
  });

  it("does not delete a task that got a hand-in while the dialog was open", async () => {
    const task = {
      id: "mt-8",
      slug: CERPEN,
      title: "Surat",
      instructions: "Tulis.",
      dueDate: inDays(5),
      createdAt: Date.now(),
    };
    localStorage.setItem("ranah.mentorTasks", JSON.stringify([task]));
    window.history.replaceState(null, "", `/kelola/mentor/${CERPEN}?tab=tugas`);
    const store = await storeWith();
    render(<MentorClassView slug={CERPEN} store={store} />);
    fireEvent.click(await screen.findByRole("button", { name: "Hapus tugas Surat" }));
    const confirm = await screen.findByRole("alertdialog");
    await act(async () => {
      await store.add(handedIn({ assignmentId: "mt-8" }));
      notifyAssignmentsChanged();
    });
    fireEvent.click(within(confirm).getByRole("button", { name: "Hapus tugas" }));
    expect(await screen.findByText(/sudah punya pengumpulan, jadi tidak dihapus/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("ranah.mentorTasks")!)).toHaveLength(1);
  });

  it("keeps a task that has hand-ins, and says why", async () => {
    const task = {
      id: "mt-7",
      slug: CERPEN,
      title: "Surat",
      instructions: "Tulis.",
      dueDate: inDays(5),
      createdAt: Date.now(),
    };
    localStorage.setItem("ranah.mentorTasks", JSON.stringify([task]));
    await open(handedIn({ assignmentId: "mt-7" }));
    const row = screen.getByRole("link", { name: "Surat" }).closest("li")!;
    expect(within(row).getByText("Sudah ada pengumpulan")).toBeTruthy();
    expect(within(row).queryByRole("button", { name: /Hapus/ })).toBeNull();
    expect(within(row).getByText(/1 pengumpulan/)).toBeTruthy();
  });
});

describe("MentorClassView, participants", () => {
  const open = async () => {
    window.history.replaceState(null, "", `/kelola/mentor/${CERPEN}?tab=peserta`);
    render(
      <MentorClassView slug={CERPEN} store={await storeWith(handedIn({ status: "selesai" }))} />,
    );
    await screen.findByRole("heading", { level: 1 });
  };

  it("lists the participant who registered on this device, with where each task stands", async () => {
    register(CERPEN);
    await open();
    const table = await screen.findByRole("table", { name: "Peserta" });
    expect(within(table).getByText("Rinjani Putri")).toBeTruthy();
    expect(within(table).getByText("1 dari 4")).toBeTruthy();
    expect(screen.getByText(/Syarat kelulusan belum ditetapkan/)).toBeTruthy();
  });

  it("says nobody has registered on this device", async () => {
    await open();
    expect(await screen.findByText("Belum ada peserta terdaftar di perangkat ini.")).toBeTruthy();
  });
});

describe("MentorReviewView", () => {
  const open = async (work = handedIn(), slug = CERPEN, id = work.id) => {
    const store = await storeWith(work);
    render(<MentorReviewView slug={slug} id={id} store={store} />);
    return store;
  };
  const steps = () =>
    within(screen.getByRole("region", { name: "Langkah berikutnya" }))
      .getAllByRole("button")
      .map((b) => b.textContent);

  it("shows the task, the frozen text and the two steps, with a way back to the class", async () => {
    await open();
    expect(
      await screen.findByRole("heading", { name: "Kerangka cerpenmu", level: 1 }),
    ).toBeTruthy();
    expect(screen.getByText("Tugas ini menunggu penilaianmu.")).toBeTruthy();
    expect(screen.getByText("kata kata kata kata kata")).toBeTruthy();
    expect(steps()).toEqual(["Minta perbaikan", "Tandai selesai"]);
    expect(
      screen.getByRole("link", { name: /Kelas Cerpen untuk Pemula/ }).getAttribute("href"),
    ).toBe(`/kelola/mentor/${CERPEN}`);
  });

  it("refuses a repair without a note, keeps the dialog, and changes nothing", async () => {
    const store = await open();
    fireEvent.click(await screen.findByRole("button", { name: "Minta perbaikan" }));
    const dialog = await screen.findByRole("dialog", { name: "Minta perbaikan" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Minta perbaikan" }));
    expect(within(dialog).getByText(/Tulis alasannya/)).toBeTruthy();
    expect((await store.list())[0].status).toBe("dikumpulkan");
  });

  it("asks for a repair with a note, which the participant is told about", async () => {
    const store = await open();
    fireEvent.click(await screen.findByRole("button", { name: "Minta perbaikan" }));
    const dialog = await screen.findByRole("dialog", { name: "Minta perbaikan" });
    fireEvent.change(within(dialog).getByLabelText(/Catatan perbaikan/), {
      target: { value: "  Perjelas tokohnya.  " },
    });
    await act(async () => within(dialog).getByRole("button", { name: "Minta perbaikan" }).click());
    await screen.findByText("Menunggu perbaikan dari peserta.");
    const [saved] = await store.list();
    expect(saved.status).toBe("perlu-perbaikan");
    expect(saved.statusLog.at(-1)).toMatchObject({ by: "mentor", reason: "Perjelas tokohnya." });
    expect(assignmentNotifications([saved]).map((n) => textOf(n))).toContainEqual(
      expect.stringMatching(/Mentor meminta perbaikan untuk tugas/),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 })),
    );
    expect(screen.queryByRole("region", { name: "Langkah berikutnya" })).toBeNull();
  });

  it("marks a task done without a note, and then offers nothing further", async () => {
    const store = await open();
    fireEvent.click(await screen.findByRole("button", { name: "Tandai selesai" }));
    const dialog = await screen.findByRole("dialog", { name: "Tandai selesai" });
    expect(within(dialog).getByText(/opsional/)).toBeTruthy();
    await act(async () => within(dialog).getByRole("button", { name: "Tandai selesai" }).click());
    await screen.findByText("Kamu sudah menandai tugas ini selesai.");
    expect((await store.list())[0].status).toBe("selesai");
    expect(screen.queryByRole("button", { name: "Minta perbaikan" })).toBeNull();
  });

  it("says so, and changes nothing, when the status moved on elsewhere", async () => {
    const store = await open();
    await screen.findByRole("button", { name: "Tandai selesai" });
    await store.update("a1", (s) => ({ ...s, status: "selesai" }));
    fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    const dialog = await screen.findByRole("dialog", { name: "Tandai selesai" });
    await act(async () => within(dialog).getByRole("button", { name: "Tandai selesai" }).click());
    expect(await screen.findByText(/Status tugas ini sudah berubah/)).toBeTruthy();
  });

  it("lets the mentor read each version after a resubmission", async () => {
    const v = (n: number, text: string) => ({
      version: n,
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] },
      wordCount: 3,
      hash: `h${n}`,
      frozenAt: n,
    });
    await open(handedIn({ versions: [v(1, "Isi satu"), v(2, "Isi dua")] }));
    expect(await screen.findByText("Isi dua")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Versi 1" }));
    expect(screen.getByText("Isi satu")).toBeTruthy();
  });

  it("refuses a class that is not assigned, and an unknown hand-in, with the way back", async () => {
    await open(handedIn({ slug: PUISI }), PUISI);
    expect(await screen.findByText("Kelas ini tidak ditugaskan kepadamu.")).toBeTruthy();
    cleanup();
    await open(handedIn(), CERPEN, "nope");
    expect(await screen.findByText("Pengumpulan ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke kelas" })).toBeTruthy();
  });
});
