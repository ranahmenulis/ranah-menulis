import { act, cleanup, configure, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { RegisterView } from "@/features/projects/components/register-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { confirmRegistration } from "@/features/projects/registration-store";
import { registration, submission } from "../helpers";

configure({ asyncUtilTimeout: 5000 });

const ESAI = "lomba-esai-literasi-remaja";
const CERPEN = "lomba-cerpen-hujan-2026";
const KELAS = "kelas-cerpen-untuk-pemula";

function register(slug: string, over = {}) {
  const key = "ranah.registrations";
  const current = JSON.parse(localStorage.getItem(key) ?? "{}");
  current[slug] = registration(slug, over);
  localStorage.setItem(key, JSON.stringify(current));
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

async function detail(slug: string, store = createMemorySubmissionStore()) {
  render(<ProjectDetail slug={slug} store={store} />);
  await screen.findByRole("heading", { level: 1 });
  return store;
}

const action = () => screen.getByRole("complementary", { name: "Pendaftaran" });

describe("project page, the send button", () => {
  it("turns Terdaftar into Kirim karya once registered and active, linking to the send page", async () => {
    register(ESAI);
    await detail(ESAI);
    const link = screen.getByRole("link", { name: "Kirim karya" });
    expect(link.getAttribute("href")).toBe(`/projects/${ESAI}/kirim`);
    expect(action().textContent).toContain("0 dari 1 karya");
  });

  it("counts the works already sent, and closes the button at the limit", async () => {
    register(ESAI);
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", slug: ESAI, docId: "d1" }), 5);
    await detail(ESAI, store);

    const button = await screen.findByRole("button", { name: "Batas karya tercapai" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(action().textContent).toContain("1 dari 1 karya");
    expect(screen.queryByRole("link", { name: "Kirim karya" })).toBeNull();
  });

  it("keeps a second place open on a project that takes two works", async () => {
    register(CERPEN);
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", slug: CERPEN, docId: "d1" }), 5);
    await detail(CERPEN, store);
    expect(await screen.findByText("1 dari 2 karya")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kirim karya" })).toBeTruthy();
  });

  it("does not offer it while payment is pending, and not for a class", async () => {
    register(CERPEN, { status: "menunggu-pembayaran" });
    await detail(CERPEN);
    expect(screen.getByRole("button", { name: "Menunggu pembayaran" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Kirim karya" })).toBeNull();
    cleanup();

    register(KELAS);
    await detail(KELAS);
    expect(screen.getByRole("button", { name: "Terdaftar" })).toBeTruthy();
    expect(screen.queryByText(/Karya terkirim/)).toBeNull();
  });

  it("waits while the count is unknown, so it never offers a send the limit would refuse", async () => {
    register(ESAI);
    const store = {
      list: () => new Promise<never>(() => {}),
      add: async () => "ok" as const,
      update: async () => "ok" as const,
    };
    render(<ProjectDetail slug={ESAI} store={store} />);
    const button = await screen.findByRole("button", { name: "Kirim karya" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole("link", { name: "Kirim karya" })).toBeNull();
  });

  it("offers the send page after a failed read, where the failure is explained and retried", async () => {
    register(ESAI);
    const store = {
      list: () => Promise.reject(new Error("idb")),
      add: async () => "ok" as const,
      update: async () => "ok" as const,
    };
    render(<ProjectDetail slug={ESAI} store={store} />);
    expect(await screen.findByRole("link", { name: "Kirim karya" })).toBeTruthy();
  });

  it("still asks to register before anything is registered", async () => {
    await detail(ESAI);
    expect(screen.getByRole("link", { name: "Daftar" })).toBeTruthy();
    expect(screen.queryByText(/Karya terkirim/)).toBeNull();
  });
});

describe("registration status, the way on to sending", () => {
  async function status(slug: string) {
    render(<RegisterView slug={slug} />);
    await screen.findByRole("heading", { level: 1 });
  }

  it("offers Kirim karya as the one filled button once registered", async () => {
    register(ESAI);
    await status(ESAI);
    expect(screen.getByRole("link", { name: "Kirim karya" }).getAttribute("href")).toBe(
      `/projects/${ESAI}/kirim`,
    );
    expect(screen.getByRole("link", { name: "Lihat proyek" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tandai lunas" })).toBeNull();
  });

  it("does not offer it for a class", async () => {
    register(KELAS);
    await status(KELAS);
    expect(screen.queryByRole("link", { name: "Kirim karya" })).toBeNull();
  });

  it("has a development-only way to mark payment done, which then opens sending", async () => {
    register(CERPEN, { status: "menunggu-pembayaran" });
    await status(CERPEN);
    expect(screen.queryByRole("link", { name: "Kirim karya" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Tandai lunas" }));
    expect(await screen.findByRole("link", { name: "Kirim karya" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tandai lunas" })).toBeNull();
  });
});

describe("confirmRegistration", () => {
  const read = () => JSON.parse(localStorage.getItem("ranah.registrations") ?? "{}");

  it("confirms one that waits, keeping the rest of the record", () => {
    register(CERPEN, { status: "menunggu-pembayaran", packageName: undefined });
    act(() => confirmRegistration(CERPEN));
    expect(read()[CERPEN]).toMatchObject({ status: "terdaftar", termsVersion: "2026-11-contoh" });
  });

  it("changes nothing for an unknown project or one already confirmed", () => {
    register(ESAI);
    const before = localStorage.getItem("ranah.registrations");
    act(() => confirmRegistration("tidak-ada"));
    act(() => confirmRegistration(ESAI));
    expect(localStorage.getItem("ranah.registrations")).toBe(before);
  });
});
