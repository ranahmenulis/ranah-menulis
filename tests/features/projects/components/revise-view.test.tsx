import { cleanup, configure, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ReviseView } from "@/features/projects/components/revise-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import { submission } from "../helpers";
import { documentsOf, register, studioDoc } from "./submit-helpers";

configure({ asyncUtilTimeout: 5000 });

const CERPEN = "lomba-cerpen-hujan-2026";
const DAY = 86_400_000;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  register(CERPEN);
});
afterEach(cleanup);

function asked(over: Partial<Submission> = {}, days = 5): Submission {
  const now = Date.now();
  return submission({
    id: "a",
    slug: CERPEN,
    title: "Hujan di Atap",
    docId: "d1",
    status: "perlu-revisi",
    statusLog: [
      { status: "terkirim", at: now - 3 * DAY, by: "sistem" },
      {
        status: "perlu-revisi",
        at: now - DAY,
        by: "editor",
        reason: "Perkuat paragraf pembuka.",
        dueAt: now + days * DAY,
      },
    ],
    ...over,
  });
}

const DOCS = [
  studioDoc("d1", "Hujan di Atap", 1500),
  studioDoc("d2", "Hujan Lain", 1800),
  studioDoc("d3", "Terlalu Pendek", 200),
];

async function open(work: Submission, store?: SubmissionStore) {
  const used = store ?? createMemorySubmissionStore();
  await used.add(work, 9);
  render(<ReviseView slug={work.slug} id={work.id} store={used} documents={documentsOf(DOCS)} />);
  await screen.findByRole("heading", { level: 1 });
  return used;
}

const send = () => screen.getByRole("button", { name: "Kirim revisi" });
const pickDoc = (name: RegExp) => fireEvent.click(screen.getByRole("radio", { name }));

describe("ReviseView, the form", () => {
  it("starts with the document already sent chosen, and shows the editor's note and the round", async () => {
    await open(asked());
    expect((screen.getByRole("radio", { name: /Hujan di Atap/ }) as HTMLInputElement).checked).toBe(
      true,
    );
    expect(screen.getByText("Perkuat paragraf pembuka.")).toBeTruthy();
    expect(screen.getByText(/Revisi ke-1 dari 2\. Tenggat/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Kembali ke karya/ }).getAttribute("href")).toBe(
      `/projects/${CERPEN}/kiriman/a`,
    );
  });

  it("sends a new frozen version and shows the confirmation", async () => {
    const store = await open(asked());
    fireEvent.change(screen.getByLabelText(/Catatan untuk editor/), {
      target: { value: "Sudah kuperkuat." },
    });
    fireEvent.click(send());

    expect(await screen.findByText("Revisimu terkirim.")).toBeTruthy();
    expect(screen.getByText(/Versi 2: 1\.500 kata/)).toBeTruthy();
    expect(screen.getByText("Revisi Terkirim")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat karya" }).getAttribute("href")).toBe(
      `/projects/${CERPEN}/kiriman/a`,
    );
    const [saved] = await store.list();
    expect(saved.versions.map((v) => v.version)).toEqual([1, 2]);
    expect(saved.status).toBe("revisi-terkirim");
    expect(saved.statusLog.at(-1)?.reason).toBe("Sudah kuperkuat.");
  });

  it("lets a different document be chosen for the revision", async () => {
    const store = await open(asked());
    pickDoc(/Hujan Lain/);
    fireEvent.click(send());
    await screen.findByText("Revisimu terkirim.");
    expect((await store.list())[0]).toMatchObject({ docId: "d2", docTitle: "Hujan Lain" });
  });

  it("shows the word-limit message at once for a document that is too short, and keeps what was typed", async () => {
    const store = await open(asked());
    fireEvent.change(screen.getByLabelText(/Catatan untuk editor/), {
      target: { value: "Catatanku." },
    });
    pickDoc(/Terlalu Pendek/);
    expect(screen.getByText(/kurang dari batas minimal/)).toBeTruthy();

    fireEvent.click(send());
    expect(await screen.findByText("Revisi belum bisa dikirim.", { exact: false })).toBeTruthy();
    expect((screen.getByLabelText(/Catatan untuk editor/) as HTMLTextAreaElement).value).toBe(
      "Catatanku.",
    );
    expect((await store.list())[0].versions).toHaveLength(1);
  });

  it("cannot pick a document that is another work of the same project", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "b", slug: CERPEN, docId: "d2" }), 9);
    await open(asked(), store);
    const radio = screen.getByRole("radio", { name: /Hujan Lain/ }) as HTMLInputElement;
    expect(radio.disabled).toBe(true);
    expect(screen.getByText("Sudah dikirim ke proyek ini")).toBeTruthy();
  });

  it("says the deadline passed when it passes while the page is open", async () => {
    const store = await open(asked({}, 5));
    // The editor's deadline moves into the past in another tab, after this page rendered.
    await store.update("a", (s) => ({
      ...s,
      statusLog: [
        ...s.statusLog.slice(0, -1),
        { ...s.statusLog.at(-1)!, dueAt: Date.now() - 1000 },
      ],
    }));
    fireEvent.click(send());
    expect(await screen.findByText(/Tenggat revisi sudah lewat/)).toBeTruthy();
    expect((await store.list())[0].versions).toHaveLength(1);
  });

  it("reports a storage failure and keeps the form", async () => {
    const base = createMemorySubmissionStore();
    const store: SubmissionStore = { ...base, update: () => Promise.reject(new Error("idb")) };
    await open(asked(), store);
    fireEvent.click(send());
    expect(await screen.findByText(/tidak bisa ditulis/)).toBeTruthy();
    expect(send()).toBeTruthy();
  });
});

describe("ReviseView, when there is nothing to revise", () => {
  it("explains a deadline that passed, with the way back to the work", async () => {
    await open(asked({}, -1));
    expect(screen.getByText("Tenggat revisi sudah lewat.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kirim revisi" })).toBeNull();
    expect(screen.getByRole("link", { name: "Lihat karya" })).toBeTruthy();
  });

  it("explains that no revision was asked for", async () => {
    await open(submission({ id: "a", slug: CERPEN, title: "Hujan di Atap" }));
    expect(
      screen.getByText("Revisi hanya bisa dikirim saat editor meminta perbaikan."),
    ).toBeTruthy();
  });

  it("explains that the rounds are used up", async () => {
    const used = asked();
    used.statusLog.splice(
      1,
      0,
      ...[1, 2].map((n) => ({ status: "revisi-terkirim" as const, at: n, by: "peserta" as const })),
    );
    await open(used);
    expect(screen.getByText("Batas putaran revisi sudah tercapai.")).toBeTruthy();
  });

  it("says a work is not found, and asks a guest to sign in", async () => {
    render(
      <ReviseView
        slug={CERPEN}
        id="nope"
        store={createMemorySubmissionStore()}
        documents={documentsOf(DOCS)}
      />,
    );
    expect(await screen.findByText("Karya ini tidak ditemukan.")).toBeTruthy();
    cleanup();

    sessionStorage.setItem("rm-viewer", "tamu");
    render(
      <ReviseView
        slug={CERPEN}
        id="a"
        store={createMemorySubmissionStore()}
        documents={documentsOf(DOCS)}
      />,
    );
    expect(await screen.findByText("Masuk untuk melihat proyek dan kirimanmu.")).toBeTruthy();
  });
});
