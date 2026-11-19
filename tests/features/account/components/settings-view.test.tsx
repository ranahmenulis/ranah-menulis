import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { parseAccount, resetAccount } from "@/features/account/account-store";
import { SettingsView } from "@/features/account/components/settings/settings-view";
import { installDialogShim } from "@/test/dialog-shim";

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: nav.push }) }));
vi.mock("@/lib/i18n/actions", () => ({ setLocale: vi.fn() }));

installDialogShim();

const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const saved = () => parseAccount(localStorage.getItem("ranah.account"));
const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  nav.push.mockReset();
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  resetAccount();
});

describe("SettingsView", () => {
  it("shows every block, with one heading level and one filled button", () => {
    wrap(<SettingsView />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Pengaturan akun");
    for (const name of [
      "Informasi pribadi",
      "Bahasa",
      "Menulis",
      "Privasi",
      "Notifikasi email",
      "Keamanan",
      "Zona bahaya",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeTruthy();
    }
  });

  it("starts on the saved profile and shows the email as verified and read-only", () => {
    wrap(<SettingsView />);
    expect((screen.getByLabelText("Nama") as HTMLInputElement).value).toBe("Rinjani Putri");
    expect(screen.getByText("rinjani@contoh.id")).toBeTruthy();
    expect(screen.getByText("Email terverifikasi")).toBeTruthy();
    expect(screen.getByText("Anggota sejak November 2026")).toBeTruthy();
    expect(screen.queryByLabelText("Email")).toBeNull();
  });

  it("lets the reader keep their own username without calling it taken", () => {
    wrap(<SettingsView />);
    fireEvent.blur(screen.getByLabelText("Username"));
    expect(screen.queryByText("Username ini sudah dipakai.")).toBeNull();
  });

  it("saves changes to the profile", () => {
    wrap(<SettingsView />);
    type("Nama", "Rinjani P.");
    type("Bio (opsional)", "Cerita baru.");
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(saved().profile.name).toBe("Rinjani P.");
    expect(saved().profile.bio).toBe("Cerita baru.");
    expect(screen.getByText("Perubahan disimpan.")).toBeTruthy();
  });

  it("does not save while the form has a mistake", () => {
    wrap(<SettingsView />);
    type("Nama", " ");
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(screen.getByText("Wajib diisi.")).toBeTruthy();
    expect(localStorage.getItem("ranah.account")).toBeNull();
  });

  it("warns about streaks only once the time zone is changed", () => {
    wrap(<SettingsView />);
    expect(screen.queryByText(/memengaruhi kapan harimu berganti/)).toBeNull();
    type("Zona waktu", "Asia/Makassar");
    expect(screen.getByText(/memengaruhi kapan harimu berganti/)).toBeTruthy();
    expect(screen.getByText(/hanya berlaku ke depan/)).toBeTruthy();
    type("Zona waktu", "Asia/Jakarta");
    expect(screen.queryByText(/memengaruhi kapan harimu berganti/)).toBeNull();
  });

  it("keeps the streak private by default and saves a switch at once", () => {
    wrap(<SettingsView />);
    const streak = screen.getByRole("checkbox", { name: /Tampilkan streak/ }) as HTMLInputElement;
    expect(streak.checked).toBe(false);
    fireEvent.click(streak);
    expect(saved().prefs.showStreak).toBe(true);
    expect(streak.checked).toBe(true);
  });

  it("saves the email preferences, which can be turned off", () => {
    wrap(<SettingsView />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Ringkasan komentar/ }));
    expect(saved().prefs.emailComments).toBe(false);
    expect(saved().prefs.emailProjects).toBe(true);
  });

  it("switches the display language", async () => {
    const { setLocale } = await import("@/lib/i18n/actions");
    wrap(<SettingsView />);
    const select = screen.getByLabelText("Bahasa tampilan");
    fireEvent.change(select, { target: { value: "en" } });
    expect(setLocale).toHaveBeenCalledWith("en");
  });

  it("saves writing choices immediately and keeps the chosen position when switching modes", () => {
    wrap(<SettingsView />);
    const size = screen.getByLabelText<HTMLSelectElement>("Ukuran teks");
    const quotes = screen.getByRole<HTMLInputElement>("checkbox", { name: /^Kutip melengkung/ });
    const substitutions = screen.getByRole<HTMLInputElement>("checkbox", {
      name: /^Tanda baca otomatis/,
    });
    expect(size.value).toBe("standard");
    expect(quotes.checked).toBe(false);
    expect(substitutions.checked).toBe(false);
    expect(screen.queryByLabelText("Posisi baris saat mengetik")).toBeNull();
    type("Ukuran teks", "large");
    type("Mode tulis", "typewriter");
    expect(screen.getByLabelText<HTMLSelectElement>("Posisi baris saat mengetik").value).toBe(
      "middle",
    );
    type("Posisi baris saat mengetik", "low");
    type("Mode tulis", "standard");
    expect(screen.queryByLabelText("Posisi baris saat mengetik")).toBeNull();
    fireEvent.click(quotes);
    fireEvent.click(substitutions);
    expect(saved().prefs.writing).toEqual({
      textSize: "large",
      mode: "standard",
      typewriterPosition: "low",
      curlyQuotes: true,
      substitutions: true,
    });
  });

  it("keeps an unsaved writing choice visible and retries without losing it", () => {
    wrap(<SettingsView />);
    const blocked = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    try {
      type("Ukuran teks", "large");
      expect(screen.getByLabelText<HTMLSelectElement>("Ukuran teks").value).toBe("large");
      expect(saved().prefs.writing.textSize).toBe("standard");
      expect(screen.getByRole("alert").textContent).toContain("Preferensi menulis belum tersimpan");
    } finally {
      blocked.mockRestore();
    }
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(saved().prefs.writing.textSize).toBe("large");
    expect(document.activeElement).toBe(screen.getByLabelText("Ukuran teks"));
  });
});

describe("SettingsView, password", () => {
  it("says the password was never changed, then changes it", () => {
    wrap(<SettingsView />);
    expect(screen.getByText("Belum pernah diubah di sini")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah kata sandi" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Simpan kata sandi" }));
    expect(within(dialog).getAllByText(/Wajib diisi|Kata sandi minimal/).length).toBeGreaterThan(0);

    fireEvent.change(within(dialog).getByLabelText("Kata sandi saat ini"), {
      target: { value: "lama12345" },
    });
    fireEvent.change(within(dialog).getByLabelText("Kata sandi baru"), {
      target: { value: "baru123456" },
    });
    fireEvent.change(within(dialog).getByLabelText("Ulangi kata sandi baru"), {
      target: { value: "baru123456" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Simpan kata sandi" }));
    expect(saved().passwordChangedAt).not.toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText(/Terakhir diubah:/)).toBeTruthy();
  });
});

describe("SettingsView, danger zone", () => {
  const open = () => {
    fireEvent.click(screen.getByRole("button", { name: "Hapus akun" }));
    return screen.getByRole("alertdialog", { name: "Hapus akun?" });
  };

  it("keeps the red button off until the word is typed", () => {
    wrap(<SettingsView />);
    const dialog = open();
    const confirm = within(dialog).getByRole("button", { name: "Hapus akun" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText("Konfirmasi"), { target: { value: "hapu" } });
    expect(confirm.disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText("Konfirmasi"), { target: { value: " hapus " } });
    expect(confirm.disabled).toBe(false);
  });

  it("clears the account and leaves for the landing page", () => {
    wrap(<SettingsView />);
    fireEvent.change(screen.getByLabelText("Nama"), { target: { value: "Diubah" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    const dialog = open();
    fireEvent.change(within(dialog).getByLabelText("Konfirmasi"), { target: { value: "HAPUS" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus akun" }));
    expect(localStorage.getItem("ranah.account")).toBeNull();
    expect(nav.push).toHaveBeenCalledWith("/");
  });

  it("cancels without touching anything", () => {
    wrap(<SettingsView />);
    const dialog = open();
    fireEvent.click(within(dialog).getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("signs out to the sign-in screen", () => {
    wrap(<SettingsView />);
    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(nav.push).toHaveBeenCalledWith("/masuk");
  });
});
