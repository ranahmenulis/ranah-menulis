import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider } from "@/lib/auth/session-context";
import { GUEST_SESSION } from "@/lib/auth/session-info";

const mocks = vi.hoisted(() => ({
  pending: vi.fn(),
  run: vi.fn(),
  live: { client: {}, store: {} } as object | null,
}));

vi.mock("@/features/studio/storage/store", () => ({
  deviceStore: () => ({}),
  accountSession: async () => mocks.live,
}));
vi.mock("@/features/studio/storage/remote/import-local", () => ({
  pendingImport: mocks.pending,
  importFromDevice: mocks.run,
}));

import { DeviceImport } from "@/features/studio/components/works/device-import";

const USER = { status: "user", userId: "u1", platformRoles: [] } as const;
const mount = (session = USER as Parameters<typeof SessionProvider>[0]["value"]) =>
  render(
    <SessionProvider value={session}>
      <DeviceImport />
    </SessionProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  mocks.live = { client: {}, store: {} };
  mocks.pending.mockReset().mockResolvedValue({ documents: 2, folders: 1 });
  mocks.run.mockReset().mockResolvedValue({ folders: 1, documents: 2, skipped: 0, days: 0 });
});
afterEach(cleanup);

describe("DeviceImport", () => {
  it("offers the copy to a signed-in person with manuscripts on the device", async () => {
    mount();
    expect(await screen.findByRole("button", { name: "Salin ke akun" })).toBeTruthy();
    expect(screen.getByText(/3 naskah dan folder/)).toBeTruthy();
  });

  it("draws nothing for a visitor and does not look at the device", async () => {
    mount(GUEST_SESSION);
    await Promise.resolve();
    expect(screen.queryByRole("button")).toBeNull();
    expect(mocks.pending).not.toHaveBeenCalled();
  });

  it("draws nothing when nothing is waiting", async () => {
    mocks.pending.mockResolvedValue({ documents: 0, folders: 0 });
    mount();
    await waitFor(() => expect(mocks.pending).toHaveBeenCalled());
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("copies, reports the result and moves focus to it", async () => {
    mocks.pending.mockResolvedValueOnce({ documents: 2, folders: 1 });
    mocks.pending.mockResolvedValueOnce({ documents: 0, folders: 0 });
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "Salin ke akun" }));
    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("2 naskah disalin ke akunmu.");
    await waitFor(() => expect(document.activeElement).toBe(status));
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("names what was skipped and keeps a quiet link for it", async () => {
    mocks.run.mockResolvedValue({ folders: 0, documents: 1, skipped: 1, days: 0 });
    mocks.pending.mockResolvedValueOnce({ documents: 2, folders: 0 });
    mocks.pending.mockResolvedValueOnce({ documents: 1, folders: 0 });
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "Salin ke akun" }));
    expect((await screen.findByRole("status")).textContent).toContain("1 naskah dilewati");
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(
      await screen.findByRole("button", { name: /Salin naskah dari perangkat ini \(1\)/ }),
    ).toBeTruthy();
  });

  it("keeps the offer and allows a retry when the copy fails", async () => {
    mocks.run.mockRejectedValueOnce(new Error("offline"));
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "Salin ke akun" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Tidak ada yang hilang");
    await waitFor(() => expect(document.activeElement).toBe(alert));
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect((await screen.findByRole("status")).textContent).toContain("disalin");
    expect(mocks.run).toHaveBeenCalledTimes(2);
  });

  it("remembers 'not now' per account and leaves a way back", async () => {
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "Nanti saja" }));
    const link = await screen.findByRole("button", {
      name: /Salin naskah dari perangkat ini \(3\)/,
    });
    expect(window.localStorage.getItem("ranah.deviceImportDismissed.u1")).toBe("1");
    await waitFor(() => expect(document.activeElement).toBe(link));

    cleanup();
    mount();
    expect(
      await screen.findByRole("button", { name: /Salin naskah dari perangkat ini/ }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Salin ke akun" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Salin naskah dari perangkat ini/ }));
    expect(await screen.findByRole("button", { name: "Salin ke akun" })).toBeTruthy();
    expect(window.localStorage.getItem("ranah.deviceImportDismissed.u1")).toBeNull();
  });

  it("does not offer when the account cannot be reached", async () => {
    mocks.live = null;
    mount();
    await Promise.resolve();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
