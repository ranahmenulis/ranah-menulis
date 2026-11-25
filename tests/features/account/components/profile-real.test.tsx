import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import type { AccountGateway } from "@/features/account/account-gateway";
import { AuthProvider } from "@/features/account/account-session";
import type { AuthGateway } from "@/features/account/auth-gateway";
import { ChangePasswordDialog } from "@/features/account/components/settings/change-password-dialog";
import { DeleteAccountDialog } from "@/features/account/components/settings/delete-account-dialog";
import { OnboardingView } from "@/features/account/components/onboarding-view";
import { emptyAccount } from "@/features/account/profile-mapping";
import type { SessionSnapshot } from "@/features/account/session-types";
import { GUEST_SESSION } from "@/lib/auth/session-info";
import { installDialogShim } from "@/test/dialog-shim";

// The real gateway reaches a Server Action that imports server-only code.
vi.mock("@/features/account/delete-account", () => ({ deleteOwnAccount: vi.fn() }));

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  search: "",
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, refresh: nav.refresh }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

installDialogShim();

type Saved = "ok" | "username-taken" | "failed";

function accounts(result: Saved = "ok") {
  return {
    updateProfile: vi.fn<AccountGateway["updateProfile"]>(async () => result),
    uploadPhoto: vi.fn<AccountGateway["uploadPhoto"]>(async () => ({ ok: false })),
    removePhoto: vi.fn<AccountGateway["removePhoto"]>(async () => {}),
  } satisfies AccountGateway;
}

function auth(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signIn: vi.fn(async () => ({ ok: true as const, onboarded: true })),
    signUp: vi.fn(async () => ({ ok: true as const, verified: false })),
    resendVerification: vi.fn(async () => ({ ok: true as const })),
    requestPasswordReset: vi.fn(async () => ({ ok: true as const })),
    updatePassword: vi.fn(async () => ({ ok: true as const })),
    changePassword: vi.fn(async () => ({ ok: true as const })),
    deleteAccount: vi.fn(async () => ({ ok: true as const })),
    signOut: vi.fn(async () => {}),
    ...overrides,
  };
}

const signedIn: SessionSnapshot = {
  session: { status: "user", userId: "u1", platformRoles: [] },
  account: emptyAccount("laras@contoh.id"),
};
const visitor: SessionSnapshot = { session: GUEST_SESSION, account: null };

function mount(ui: ReactNode, gateway: AccountGateway, gate: AuthGateway, snapshot = signedIn) {
  return render(
    <ToastProvider>
      <AuthProvider snapshot={snapshot} gateway={gateway} auth={gate}>
        {ui}
      </AuthProvider>
    </ToastProvider>,
  );
}

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const press = (name: string, scope: HTMLElement | Document = document) =>
  act(async () => {
    fireEvent.click(within(scope as HTMLElement).getByRole("button", { name }));
  });

beforeEach(() => {
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.refresh.mockReset();
  nav.search = "";
});
afterEach(cleanup);

describe("Mulai with a signed-in account", () => {
  const fill = () => {
    type("Nama", "Laras Ayu");
    type("Username", "laras_ayu");
  };

  it("saves the profile, marks it finished, and moves on to the destination", async () => {
    nav.search = "lanjut=%2Fprojects";
    const gateway = accounts();
    mount(<OnboardingView />, gateway, auth());
    fill();
    await press("Mulai menulis");
    expect(gateway.updateProfile).toHaveBeenCalledTimes(1);
    expect(gateway.updateProfile.mock.calls[0]?.[0]).toBe("u1");
    expect(gateway.updateProfile.mock.calls[0]?.[1]).toMatchObject({
      display_name: "Laras Ayu",
      username: "laras_ayu",
    });
    expect(
      Number.isNaN(Date.parse(gateway.updateProfile.mock.calls[0]?.[1].onboarded_at ?? "")),
    ).toBe(false);
    expect(nav.refresh).toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/projects");
  });

  it("stays put and marks the field when the username was taken meanwhile", async () => {
    mount(<OnboardingView />, accounts("username-taken"), auth());
    fill();
    await press("Mulai menulis");
    expect(screen.getByText("Username ini sudah dipakai.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Username"));
    expect(nav.push).not.toHaveBeenCalled();
    // Typing another username takes the message away.
    type("Username", "laras_dua");
    expect(screen.queryByText("Username ini sudah dipakai.")).toBeNull();
  });

  it("says so and stays when the profile could not be saved", async () => {
    mount(<OnboardingView />, accounts("failed"), auth());
    fill();
    await press("Mulai menulis");
    expect(screen.getByText(/Periksa koneksimu/)).toBeTruthy();
    expect(nav.push).not.toHaveBeenCalled();
  });
});

describe("Mulai without an account", () => {
  it("sends a visitor to Masuk, keeping the destination", () => {
    nav.search = "lanjut=%2Fstudio";
    mount(<OnboardingView />, accounts(), auth(), visitor);
    expect(nav.replace).toHaveBeenCalledWith("/masuk?lanjut=%2Fstudio");
    expect(screen.queryByLabelText("Nama")).toBeNull();
  });
});

describe("Ubah kata sandi with a real sign-in system", () => {
  const open = (gate: AuthGateway, onClose = vi.fn()) => {
    mount(<ChangePasswordDialog onClose={onClose} />, accounts(), gate);
    const dialog = screen.getByRole("dialog");
    const set = (label: string, value: string) =>
      fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
    set("Kata sandi saat ini", "Lama12345!");
    set("Kata sandi baru", "Baru123456!");
    set("Ulangi kata sandi baru", "Baru123456!");
    return { dialog, onClose };
  };

  it("changes the password and closes", async () => {
    const gate = auth();
    const { dialog, onClose } = open(gate);
    await press("Simpan kata sandi", dialog);
    expect(gate.changePassword).toHaveBeenCalledWith("Lama12345!", "Baru123456!");
    expect(onClose).toHaveBeenCalled();
  });

  it("says the current password is wrong and keeps the dialog open", async () => {
    const gate = auth({
      changePassword: vi.fn(async () => ({ ok: false as const, reason: "credentials" as const })),
    });
    const { dialog, onClose } = open(gate);
    await press("Simpan kata sandi", dialog);
    expect(within(dialog).getByText("Kata sandi saat ini salah.")).toBeTruthy();
    expect(document.activeElement).toBe(within(dialog).getByLabelText("Kata sandi saat ini"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks for a different password when it is the same as the old one", async () => {
    const gate = auth({
      changePassword: vi.fn(async () => ({ ok: false as const, reason: "same" as const })),
    });
    const { dialog } = open(gate);
    await press("Simpan kata sandi", dialog);
    expect(within(dialog).getByRole("alert").textContent).toMatch(/berbeda dari yang lama/);
  });

  it("says it could not be changed when the connection fails", async () => {
    const gate = auth({
      changePassword: vi.fn(async () => ({ ok: false as const, reason: "network" as const })),
    });
    const { dialog, onClose } = open(gate);
    await press("Simpan kata sandi", dialog);
    expect(within(dialog).getByRole("alert").textContent).toMatch(/belum bisa diubah/);
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Hapus akun with a real sign-in system", () => {
  const confirm = async (gate: AuthGateway) => {
    mount(<DeleteAccountDialog onClose={vi.fn()} />, accounts(), gate);
    const dialog = screen.getByRole("alertdialog");
    fireEvent.change(within(dialog).getByLabelText("Konfirmasi"), { target: { value: "HAPUS" } });
    await press("Hapus akun", dialog);
    return dialog;
  };

  it("deletes the account, refreshes the session, and leaves for the landing page", async () => {
    const gate = auth();
    await confirm(gate);
    expect(gate.deleteAccount).toHaveBeenCalledTimes(1);
    expect(nav.refresh).toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/");
  });

  it("says so and stays when the account could not be deleted", async () => {
    const dialog = await confirm(
      auth({
        deleteAccount: vi.fn(async () => ({ ok: false as const, reason: "failed" as const })),
      }),
    );
    expect(within(dialog).getByRole("alert").textContent).toMatch(/belum bisa dihapus/);
    expect(nav.push).not.toHaveBeenCalled();
  });
});
