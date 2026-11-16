import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubmitView } from "@/features/projects/components/submit-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { textOf } from "../helpers";
import {
  agree,
  backLink,
  CERPEN,
  docs,
  documentsOf,
  ESAI,
  field,
  fillAndSend,
  open,
  pickDoc,
  register,
  send,
  studioDoc,
} from "./submit-helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SubmitView, why the form is not offered", () => {
  it("sends an unregistered reader to register, and keeps the way back", async () => {
    await open();
    expect(screen.getByText(/belum terdaftar di proyek ini/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Daftar" }).getAttribute("href")).toBe(
      `/projects/${ESAI}/daftar`,
    );
    expect(backLink().getAttribute("href")).toBe(`/projects/${ESAI}`);
    expect(screen.queryByRole("button", { name: "Kirim karya" })).toBeNull();
  });

  it("waits for payment before sending is possible", async () => {
    register(CERPEN, { status: "menunggu-pembayaran" });
    await open({ slug: CERPEN });
    expect(screen.getByText(/masih menunggu pembayaran/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kirim karya" })).toBeNull();
  });

  it("says a closed project no longer takes work, and a class collects assignments instead", async () => {
    register("antologi-pulang-ke-pesisir");
    await open({ slug: "antologi-pulang-ke-pesisir" });
    expect(screen.getByText("Pengiriman karya ke proyek ini sudah ditutup.")).toBeTruthy();
    cleanup();

    register("kelas-cerpen-untuk-pemula");
    await open({ slug: "kelas-cerpen-untuk-pemula" });
    expect(screen.getByText(/Tugas kelas dikumpulkan di halaman tugas/)).toBeTruthy();
  });

  it("treats a draft project and an unknown address as not found", async () => {
    render(<SubmitView slug="antologi-puisi-tengah-malam" store={createMemorySubmissionStore()} />);
    expect(await screen.findByText(/Proyek ini tidak ditemukan/)).toBeTruthy();
  });
});

describe("SubmitView, the form", () => {
  beforeEach(() => register(ESAI));

  it("names the project, the rules, and lists documents with the ones that cannot be sent", async () => {
    await open();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Kirim karya: Lomba Esai Literasi Remaja",
    );
    expect(screen.getByText(/Naskah 700 sampai 1\.200 kata/)).toBeTruthy();
    expect((screen.getByRole("radio", { name: /Masih Kosong/ }) as HTMLInputElement).disabled).toBe(
      true,
    );
    expect(screen.queryByRole("radio", { name: /Sudah di Sampah/ })).toBeNull();
    expect(backLink().getAttribute("href")).toBe(`/projects/${ESAI}`);
  });

  it("opens with the document from the address chosen and its title filled in", async () => {
    await open({ documentId: "d1" });
    expect(
      (screen.getByRole("radio", { name: /Buku yang Mengubahku/ }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(field(/Judul karya/).value).toBe("Buku yang Mengubahku");
  });

  it("says so, without choosing anything, when the document in the address is gone", async () => {
    await open({ documentId: "tidak-ada" });
    expect(screen.getByText(/tidak tersedia lagi/)).toBeTruthy();
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
  });

  it("shows the word check as soon as a document is chosen", async () => {
    await open();
    pickDoc(/Terlalu Pendek/);
    expect(screen.getByText(/Naskahmu 100 kata, kurang dari batas minimal 700 kata/)).toBeTruthy();
    pickDoc(/Buku yang Mengubahku/);
    expect(screen.getByText(/800 kata, sesuai batas 700 sampai 1\.200 kata/)).toBeTruthy();
  });

  it("lists every rule that is broken when sending, keeps what was typed, and stores nothing", async () => {
    const store = await open();
    fireEvent.change(field(/Judul karya/), { target: { value: "Judul saya" } });
    fireEvent.click(send());

    expect(screen.getByText("Pilih dokumen dari Studio.")).toBeTruthy();
    expect(screen.getByText("Pilih genre.")).toBeTruthy();
    expect(screen.getByText("Setujui pernyataan keaslian karya.")).toBeTruthy();
    expect(screen.getByText(/Periksa bagian yang ditandai/)).toBeTruthy();
    expect(field(/Judul karya/).value).toBe("Judul saya");
    expect(await store.list()).toEqual([]);
  });

  it("warns that an anonymous contest cannot check names inside the work", async () => {
    await open();
    expect(screen.getByText(/Penilaian lomba ini anonim/)).toBeTruthy();
    cleanup();
    register("lomba-puisi-pendek-nusantara");
    await open({ slug: "lomba-puisi-pendek-nusantara" });
    expect(screen.queryByText(/Penilaian lomba ini anonim/)).toBeNull();
  });
});

describe("SubmitView, sending", () => {
  beforeEach(() => register(ESAI));

  it("freezes the document, stores a Terkirim work, and says what was frozen", async () => {
    const store = await open();
    await fillAndSend();

    expect(await screen.findByText("Karyamu terkirim.")).toBeTruthy();
    expect(screen.getByText("Terkirim")).toBeTruthy();
    expect(screen.getByText(/salinan beku dokumenmu: 800 kata/)).toBeTruthy();
    const [saved] = await store.list();
    expect(saved).toMatchObject({ slug: ESAI, title: "Buku yang Mengubahku", genre: "Esai" });
    expect(saved.versions[0].hash).toMatch(/^[0-9a-f]{64}$/);
    expect(screen.getByRole("link", { name: "Lihat proyek" }).getAttribute("href")).toBe(
      `/projects/${ESAI}`,
    );
    // One work is the limit here, so there is nothing more to send.
    expect(screen.queryByRole("button", { name: "Kirim karya lain" })).toBeNull();
  });

  it("offers another work when the project takes more, with the first no longer pickable", async () => {
    register(CERPEN);
    await open({
      slug: CERPEN,
      documents: documentsOf([
        studioDoc("d1", "Hujan Pertama", 1200),
        studioDoc("d5", "Hujan Kedua", 1500),
      ]),
    });
    pickDoc(/Hujan Pertama/);
    fireEvent.change(field(/Genre/), { target: { value: "Cerpen" } });
    agree();
    fireEvent.click(send());
    fireEvent.click(await screen.findByRole("button", { name: "Kirim karya lain" }));

    expect(await screen.findByText(/sudah mengirim 1 dari 2 karya/)).toBeTruthy();
    expect(
      (screen.getByRole("radio", { name: /Hujan Pertama/ }) as HTMLInputElement).disabled,
    ).toBe(true);
    expect(screen.getByText("Sudah dikirim ke proyek ini")).toBeTruthy();
    expect(screen.getByText("Karya yang sudah kamu kirim")).toBeTruthy();
  });

  it("after the limit, shows the works sent instead of the form", async () => {
    const store = await open();
    await fillAndSend();
    await screen.findByText("Karyamu terkirim.");
    cleanup();

    await open({ store });
    expect(screen.getByText(/Kamu sudah mengirim 1 karya, batas untuk proyek ini/)).toBeTruthy();
    expect(screen.getByText("Karya yang sudah kamu kirim")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kirim karya" })).toBeNull();
  });

  it("keeps everything typed and says so when the device cannot store the work", async () => {
    const store: SubmissionStore = {
      list: async () => [],
      add: async () => Promise.reject(new Error("idb")),
      update: async () => "ok" as const,
    };
    await open({ store });
    await fillAndSend();

    expect(await screen.findByText(/Karya belum terkirim/)).toBeTruthy();
    expect(field(/Judul karya/).value).toBe("Buku yang Mengubahku");
    expect(
      (screen.getByRole("radio", { name: /Buku yang Mengubahku/ }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(send()).toBeTruthy();
  });

  it("refuses a work that was shortened after the page opened, from the document read fresh", async () => {
    const live = studioDoc("d1", "Buku yang Mengubahku", 800);
    const documents = {
      ...documentsOf([live]),
      get: async () => ({ ...live, content: textOf(50) }),
    } as unknown as DocumentStore;
    const store = await open({ documents });
    await fillAndSend();

    expect(
      await screen.findByText(/Naskahmu 50 kata, kurang dari batas minimal 700 kata/),
    ).toBeTruthy();
    expect(await store.list()).toEqual([]);
    expect(field(/Judul karya/).value).toBe("Buku yang Mengubahku");
  });
});

describe("SubmitView, the draft and Solo", () => {
  it("brings back the typed fields, but never the statement", async () => {
    register(ESAI);
    await open();
    fireEvent.change(field(/Judul karya/), { target: { value: "Judul sementara" } });
    fireEvent.change(field(/Catatan untuk editor/), { target: { value: "Catatan saya" } });
    agree();
    cleanup();

    await open();
    expect(field(/Judul karya/).value).toBe("Judul sementara");
    expect(field(/Catatan untuk editor/).value).toBe("Catatan saya");
    expect(
      (screen.getByRole("checkbox", { name: /karya saya sendiri/ }) as HTMLInputElement).checked,
    ).toBe(false);
  });

  it("asks Solo for the kind of book and a synopsis", async () => {
    register("solo-penerbitan-buku-sendiri", { packageName: "Penerbitan Penuh" });
    await open({
      slug: "solo-penerbitan-buku-sendiri",
      documents: documentsOf([studioDoc("n1", "Novelku", 20000)]),
    });
    expect(field(/Jenis buku/)).toBeTruthy();
    expect(field(/Sinopsis/)).toBeTruthy();
    expect(screen.queryByLabelText(/^Genre/)).toBeNull();

    pickDoc(/Novelku/);
    fireEvent.change(field(/Jenis buku/), { target: { value: "Novel" } });
    fireEvent.change(field(/Sinopsis/), { target: { value: "Kisah satu keluarga." } });
    agree();
    fireEvent.click(send());
    await screen.findByText("Karyamu terkirim.");
  });
});

describe("SubmitView, reading fails", () => {
  it("is an error with a retry when submissions cannot be read, never an empty form", async () => {
    register(ESAI);
    const store: SubmissionStore = {
      list: () => Promise.reject(new Error("idb")),
      add: async () => "ok",
      update: async () => "ok" as const,
    };
    render(<SubmitView slug={ESAI} store={store} documents={documentsOf(docs)} />);
    expect(await screen.findByText(/belum bisa dibuka/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeTruthy();
    expect(backLink().getAttribute("href")).toBe(`/projects/${ESAI}`);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Kirim karya" })).toBeNull());
  });
});
