import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import type { AuthGateway } from "@/features/account/auth-gateway";
import { AuthGatewayProvider } from "@/features/account/auth-gateway-context";
import { ForgotForm } from "@/features/account/components/forgot-form";
import { ResetForm } from "@/features/account/components/reset-form";
import { SignInForm } from "@/features/account/components/sign-in-form";
import { SignUpForm } from "@/features/account/components/sign-up-form";
import { VerifyView } from "@/features/account/components/verify-view";
import { readPendingEmail, rememberPendingEmail } from "@/features/account/pending-email";
import { SessionProvider } from "@/lib/auth/session-context";
import { GUEST_SESSION } from "@/lib/auth/session-info";

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

/** A sign-in system as the app mounts it with Supabase (everything succeeds unless overridden). */
function gateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
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

function mount(ui: ReactNode, auth: AuthGateway, signedIn = false) {
  const session = signedIn
    ? { status: "user" as const, userId: "u1", platformRoles: [] }
    : GUEST_SESSION;
  return render(
    <SessionProvider value={session}>
      <AuthGatewayProvider value={auth}>
        <ToastProvider>{ui}</ToastProvider>
      </AuthGatewayProvider>
    </SessionProvider>,
  );
}

async function press(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.refresh.mockReset();
  nav.search = "";
  sessionStorage.clear();
  rememberPendingEmail("");
});
afterEach(cleanup);

describe("Masuk with a real sign-in system", () => {
  it("hides the Google button when continueWithGoogle is absent", () => {
    mount(<SignInForm />, gateway());
    expect(screen.queryByRole("button", { name: "Masuk dengan Google" })).toBeNull();
  });

  it("shows the Google button and passes the destination when continueWithGoogle exists", async () => {
    nav.search = "lanjut=%2Fstudio";
    const continueWithGoogle = vi.fn(async () => null);
    mount(<SignInForm />, gateway({ continueWithGoogle }));
    await press("Masuk dengan Google");
    expect(continueWithGoogle).toHaveBeenCalledWith("signIn", "/studio");
  });

  it("refreshes the session and goes on to the destination", async () => {
    nav.search = "lanjut=%2Fstudio";
    const auth = gateway();
    mount(<SignInForm />, auth);
    type("Email", " laras@contoh.id ");
    type("Kata sandi", "Rahasia123!");
    await press("Masuk");
    expect(auth.signIn).toHaveBeenCalledWith("laras@contoh.id", "Rahasia123!");
    expect(nav.refresh).toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/studio");
  });

  it("sends a profile that is not finished to Mulai, keeping the destination", async () => {
    nav.search = "lanjut=%2Fstudio";
    mount(
      <SignInForm />,
      gateway({ signIn: vi.fn(async () => ({ ok: true as const, onboarded: false })) }),
    );
    type("Email", "laras@contoh.id");
    type("Kata sandi", "Rahasia123!");
    await press("Masuk");
    expect(nav.push).toHaveBeenCalledWith("/mulai?lanjut=%2Fstudio");
  });

  it.each([
    ["limit", /Terlalu banyak percobaan/],
    ["network", /Belum tersambung/],
  ] as const)("says so when the system answers %s", async (reason, text) => {
    mount(<SignInForm />, gateway({ signIn: vi.fn(async () => ({ ok: false as const, reason })) }));
    type("Email", "laras@contoh.id");
    type("Kata sandi", "Rahasia123!");
    await press("Masuk");
    expect(screen.getByRole("alert").textContent).toMatch(text);
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("asks for the verification email again and names the address on the next screen", async () => {
    const auth = gateway({
      signIn: vi.fn(async () => ({ ok: false as const, reason: "unverified" as const })),
    });
    mount(<SignInForm />, auth);
    type("Email", "laras@contoh.id");
    type("Kata sandi", "Rahasia123!");
    await press("Masuk");
    await press("Kirim ulang email");
    expect(auth.resendVerification).toHaveBeenCalledWith("laras@contoh.id", null);
    expect(readPendingEmail()).toBe("laras@contoh.id");
    expect(nav.push).toHaveBeenCalledWith("/verifikasi");
  });
});

describe("Daftar with a real sign-in system", () => {
  const toPassword = () => {
    type("Email", "baru@contoh.id");
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));
  };
  const finish = async () => {
    type("Kata sandi", "Rahasia123!");
    fireEvent.click(screen.getByRole("checkbox"));
    await press("Daftar");
  };

  it("cannot know an address is taken at the first step, so it goes on", () => {
    mount(<SignUpForm />, gateway());
    toPassword();
    expect(screen.getByText("Langkah 2 dari 2")).toBeTruthy();
  });

  it("goes to the email step with the registered message when the answer comes at the end", async () => {
    mount(
      <SignUpForm />,
      gateway({ signUp: vi.fn(async () => ({ ok: false as const, reason: "exists" as const })) }),
    );
    toPassword();
    await finish();
    expect(screen.getByText("Langkah 1 dari 2")).toBeTruthy();
    expect(screen.getByText(/Email ini sudah terdaftar/)).toBeTruthy();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("sends the address and the destination, then waits for the verification email", async () => {
    nav.search = "lanjut=%2Fprojects";
    const auth = gateway();
    mount(<SignUpForm />, auth);
    toPassword();
    await finish();
    expect(auth.signUp).toHaveBeenCalledWith("baru@contoh.id", "Rahasia123!", "/projects");
    expect(readPendingEmail()).toBe("baru@contoh.id");
    expect(nav.push).toHaveBeenCalledWith("/verifikasi?lanjut=%2Fprojects");
  });

  it("goes straight to the profile when no email step is needed", async () => {
    mount(
      <SignUpForm />,
      gateway({ signUp: vi.fn(async () => ({ ok: true as const, verified: true })) }),
    );
    toPassword();
    await finish();
    expect(nav.refresh).toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/mulai");
  });

  it("keeps the form and says what went wrong", async () => {
    mount(
      <SignUpForm />,
      gateway({ signUp: vi.fn(async () => ({ ok: false as const, reason: "limit" as const })) }),
    );
    toPassword();
    await finish();
    expect(screen.getByRole("alert").textContent).toMatch(/Terlalu banyak percobaan/);
    expect(nav.push).not.toHaveBeenCalled();
  });
});

describe("Verifikasi with a real sign-in system", () => {
  it("names the address from this tab and offers no example links", () => {
    rememberPendingEmail("baru@contoh.id");
    mount(<VerifyView />, gateway());
    expect(screen.getByText(/Kami mengirim tautan ke baru@contoh.id/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Contoh/ })).toBeNull();
  });

  it("sends the email again through the system", async () => {
    vi.useFakeTimers();
    try {
      rememberPendingEmail("baru@contoh.id");
      const auth = gateway();
      mount(<VerifyView />, auth);
      act(() => {
        vi.advanceTimersByTime(31_000);
      });
      await press("Kirim ulang email");
      expect(auth.resendVerification).toHaveBeenCalledWith("baru@contoh.id", null);
    } finally {
      vi.useRealTimers();
    }
  });

  it("sends an expired link opened in another browser to Masuk, where the resend is offered", async () => {
    nav.search = "status=kedaluwarsa";
    mount(<VerifyView />, gateway());
    await press("Kirim email baru");
    expect(nav.push).toHaveBeenCalledWith("/masuk");
  });
});

describe("Lupa sandi with a real sign-in system", () => {
  it("offers no example links after sending", async () => {
    const auth = gateway();
    mount(<ForgotForm />, auth);
    type("Email", " a@contoh.id ");
    await press("Kirim tautan");
    expect(auth.requestPasswordReset).toHaveBeenCalledWith("a@contoh.id");
    expect(screen.getByText(/Jika a@contoh.id terdaftar/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Contoh/ })).toBeNull();
  });

  it("stays on the form and says so when the link could not be sent", async () => {
    mount(
      <ForgotForm />,
      gateway({
        requestPasswordReset: vi.fn(async () => ({ ok: false as const, reason: "limit" as const })),
      }),
    );
    type("Email", "a@contoh.id");
    await press("Kirim tautan");
    expect(screen.getByRole("alert").textContent).toMatch(/Terlalu banyak percobaan/);
    expect(screen.queryByText("Cek emailmu")).toBeNull();
  });
});

describe("Atur ulang sandi with a real sign-in system", () => {
  const fill = () => {
    type("Kata sandi baru", "Rahasia123!");
    type("Ulangi kata sandi baru", "Rahasia123!");
  };

  it("shows the expired state when the link did not sign the reader in", () => {
    mount(<ResetForm />, gateway(), false);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tautan sudah kedaluwarsa");
  });

  it("saves the password, shows it is done, and signs the reader out", async () => {
    const auth = gateway();
    mount(<ResetForm />, auth, true);
    fill();
    await press("Simpan kata sandi");
    expect(auth.updatePassword).toHaveBeenCalledWith("Rahasia123!");
    expect(screen.getByText("Kata sandi diperbarui")).toBeTruthy();
    expect(auth.signOut).toHaveBeenCalled();
    expect(nav.refresh).toHaveBeenCalled();
  });

  it("asks for a different password when it is the same as the old one", async () => {
    mount(
      <ResetForm />,
      gateway({
        updatePassword: vi.fn(async () => ({ ok: false as const, reason: "same" as const })),
      }),
      true,
    );
    fill();
    await press("Simpan kata sandi");
    expect(screen.getByRole("alert").textContent).toMatch(/berbeda dari yang lama/);
  });

  it("turns into the expired state when the recovery session ended meanwhile", async () => {
    mount(
      <ResetForm />,
      gateway({
        updatePassword: vi.fn(async () => ({ ok: false as const, reason: "expired" as const })),
      }),
      true,
    );
    fill();
    await press("Simpan kata sandi");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tautan sudah kedaluwarsa");
  });
});
