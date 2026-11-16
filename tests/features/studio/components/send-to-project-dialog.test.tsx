import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SendToProjectDialog } from "@/features/studio/components/send-to-project-dialog";
import { notifySubmissionsChanged } from "@/features/projects/storage/submission-events";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { Registration } from "@/features/projects/types";
import { installDialogShim } from "@/test/dialog-shim";
import { registration, submission } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });

beforeAll(installDialogShim);
beforeEach(() => localStorage.clear());
afterEach(cleanup);

const ESAI = "lomba-esai-literasi-remaja";
const CERPEN = "lomba-cerpen-hujan-2026";

function register(...list: Registration[]) {
  localStorage.setItem(
    "ranah.registrations",
    JSON.stringify(Object.fromEntries(list.map((r) => [r.slug, r]))),
  );
}

function open(over: Partial<ComponentProps<typeof SendToProjectDialog>> = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    docId: "d1",
    onPick: vi.fn(async () => true),
    store: createMemorySubmissionStore(),
    ...over,
  };
  render(<SendToProjectDialog {...props} />);
  return props;
}

const next = () => screen.getByRole("button", { name: "Lanjutkan" }) as HTMLButtonElement;

describe("SendToProjectDialog, without a project to send to", () => {
  it("says so and offers the way to find projects, with nothing to pick", async () => {
    open();
    expect(await screen.findByText(/belum terdaftar di proyek yang menerima karya/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat Projects" }).getAttribute("href")).toBe(
      "/projects",
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(next().disabled).toBe(true);
  });

  it("closes itself before following the link, so no modal is left open on the next page", async () => {
    const { onClose } = open();
    fireEvent.click(await screen.findByRole("link", { name: "Lihat Projects" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores a project you registered for that takes no submissions (Kelas)", async () => {
    register(registration("kelas-cerpen-untuk-pemula"));
    open();
    expect(await screen.findByText(/belum terdaftar di proyek yang menerima karya/)).toBeTruthy();
  });
});

describe("SendToProjectDialog, with registrations", () => {
  it("lists the projects you can send to, and hands the chosen one over", async () => {
    register(registration(ESAI));
    const { onPick } = open();
    fireEvent.click(await screen.findByRole("radio", { name: /Lomba Esai Literasi Remaja/ }));
    expect(next().disabled).toBe(false);
    fireEvent.click(next());
    await waitFor(() => expect(onPick).toHaveBeenCalledWith(ESAI));
  });

  it("keeps a project that cannot take it listed, with the reason, and cannot be picked", async () => {
    register(registration(ESAI), registration(CERPEN, { status: "menunggu-pembayaran" }));
    open();
    const waiting = await screen.findByRole("radio", { name: /Lomba Cerpen Hujan/ });
    expect((waiting as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText("Menunggu pembayaran")).toBeTruthy();
    expect(
      (screen.getByRole("radio", { name: /Esai Literasi/ }) as HTMLInputElement).disabled,
    ).toBe(false);
  });

  it("marks a project that already has this document, and one at its limit", async () => {
    register(registration(ESAI), registration(CERPEN));
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", slug: ESAI, docId: "other" }), 5);
    await store.add(submission({ id: "b", slug: CERPEN, docId: "d1" }), 5);
    open({ store });
    expect(await screen.findByText("Batas karya tercapai")).toBeTruthy();
    expect(screen.getByText("Dokumen ini sudah dikirim ke sini")).toBeTruthy();
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
  });

  it("drops a choice that stopped being possible while the dialog was open", async () => {
    register(registration(ESAI));
    const store = createMemorySubmissionStore();
    open({ store });
    fireEvent.click(await screen.findByRole("radio", { name: /Esai Literasi/ }));
    expect(next().disabled).toBe(false);

    await act(async () => {
      await store.add(submission({ id: "a", slug: ESAI, docId: "other" }), 5);
      notifySubmissionsChanged();
    });
    await waitFor(() => expect(next().disabled).toBe(true));
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
  });

  it("says the text could not be stored when the editor refuses, and stays open", async () => {
    register(registration(ESAI));
    const onPick = vi.fn(async () => false);
    const { onClose } = open({ onPick });
    fireEvent.click(await screen.findByRole("radio", { name: /Esai Literasi/ }));
    fireEvent.click(next());
    expect(await screen.findByText(/belum tersimpan di perangkat ini/)).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("SendToProjectDialog, reading fails", () => {
  it("is an error with a retry, never an empty list", async () => {
    const store = { list: () => Promise.reject(new Error("idb")), add: async () => "ok" as const };
    open({ store });
    expect(await screen.findByText(/belum bisa dibaca dari perangkat ini/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeTruthy();
  });
});

describe("SendToProjectDialog, closing", () => {
  it("closes with Batal", async () => {
    const { onClose } = open();
    await screen.findByText(/belum terdaftar/);
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
