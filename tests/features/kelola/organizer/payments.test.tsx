import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: vi.fn() }),
}));

import { ManageView } from "@/features/kelola/organizer/components/manage-view";
import { paymentRow } from "@/features/kelola/organizer/payment-rows";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { resolveProjects } from "@/features/projects/project-model";
import { parseRegistrations, settlePayment } from "@/features/projects/registration-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { installDialogShim } from "@/test/dialog-shim";
import { registration } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const HOUR = 3_600_000;
const FREE = "lomba-puisi-pendek-nusantara";
const PAID = "lomba-cerpen-hujan-2026";
const CERPEN = PAID;
const PUISI = "kelas-menulis-puisi-dasar";

function open(slug: string, tab = "pembayaran") {
  window.history.replaceState(null, "", `/kelola/organizer/${slug}?tab=${tab}`);
  render(<ManageView slug={slug} store={createMemorySubmissionStore()} />);
}

const put = (slug: string, over: Parameters<typeof registration>[1]) =>
  localStorage.setItem("ranah.registrations", JSON.stringify({ [slug]: registration(slug, over) }));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("rm-roles", "organizer");
});
afterEach(cleanup);

describe("payments tab", () => {
  it("is only offered for a project that costs money", async () => {
    open(PUISI, "proyek");
    expect(await screen.findByRole("link", { name: "Pembayaran" })).toBeTruthy();
    cleanup();
    open(FREE, "proyek");
    await screen.findByRole("link", { name: "Peserta" });
    expect(screen.queryByRole("link", { name: "Pembayaran" })).toBeNull();
  });

  it("says nothing was registered here", async () => {
    open(CERPEN);
    expect(await screen.findByText("Belum ada pendaftar di perangkat ini.")).toBeTruthy();
  });

  it("confirms a waiting payment after asking, says so, and the participant becomes registered", async () => {
    put(CERPEN, { status: "menunggu-pembayaran" });
    open(CERPEN);
    expect(await screen.findByText("Menunggu pembayaran")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi pembayaran" }));
    const dialog = await screen.findByRole("dialog", { name: "Konfirmasi pembayaran ini?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Konfirmasi pembayaran" }));
    expect(await screen.findByText(/Pembayaran dikonfirmasi/)).toBeTruthy();
    expect(screen.getByText("Lunas")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Konfirmasi pembayaran" })).toBeNull();
    const saved = parseRegistrations(localStorage.getItem("ranah.registrations"))[CERPEN];
    expect(saved).toMatchObject({ status: "terdaftar", paidBy: "organizer" });
  });

  it("does not confirm a payment that arrived while the dialog was open", async () => {
    put(CERPEN, { status: "menunggu-pembayaran" });
    open(CERPEN);
    fireEvent.click(await screen.findByRole("button", { name: "Konfirmasi pembayaran" }));
    const dialog = await screen.findByRole("dialog");
    settlePayment(CERPEN, Date.now());
    fireEvent.click(within(dialog).getByRole("button", { name: "Konfirmasi pembayaran" }));
    expect(await screen.findByText(/sudah lunas atau waktu tahanannya habis/)).toBeTruthy();
    expect(parseRegistrations(localStorage.getItem("ranah.registrations"))[CERPEN].paidBy).toBe(
      "sistem",
    );
  });

  it("shows an expired hold as expired, without a confirm button", async () => {
    put(CERPEN, { status: "menunggu-pembayaran", registeredAt: Date.now() - 25 * HOUR });
    open(CERPEN);
    expect(await screen.findByText("Waktu pembayaran habis")).toBeTruthy();
    expect(screen.getByText("Kursinya sudah dibuka lagi.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Konfirmasi pembayaran" })).toBeNull();
  });

  it("says a free project has no payments", async () => {
    open(FREE);
    expect(await screen.findByText("Proyek ini gratis, jadi tidak ada pembayaran.")).toBeTruthy();
  });
});

describe("paymentRow", () => {
  const now = Date.now();
  const [project] = resolveProjects(
    projectFixtures.filter((p) => p.slug === CERPEN),
    now,
  );

  it("is null without a registration or for a free project", () => {
    expect(paymentRow(project, undefined, now)).toBeNull();
    const [free] = resolveProjects(
      projectFixtures.filter((p) => p.slug === FREE),
      now,
    );
    expect(paymentRow(free, registration(FREE), now)).toBeNull();
  });

  it("reports the state, the amount and who confirmed", () => {
    const waiting = registration(CERPEN, { status: "menunggu-pembayaran" });
    expect(paymentRow(project, waiting, now)).toMatchObject({ state: "menunggu", amount: 35_000 });
    const paid = registration(CERPEN, { paidAt: now, paidBy: "organizer" });
    expect(paymentRow(project, paid, now)).toMatchObject({ state: "lunas", paidBy: "organizer" });
  });
});
