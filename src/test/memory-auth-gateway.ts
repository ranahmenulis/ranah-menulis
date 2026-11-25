import { withoutSampleMe, writingGroups } from "@/features/community/groups/group-store";
import { DEFAULT_ACCOUNT, resetAccount, saveAccount } from "@/features/account/account-store";
import type { AuthGateway } from "@/features/account/auth-gateway";
import { countryForZone, deviceTimeZone } from "@/features/account/timezones";
import { setViewer } from "@/lib/viewer";

/**
 * In-memory sign-in system for component tests (installed by `tests/setup.ts`). Nothing is checked
 * against a server. A few addresses show each state:
 *
 * - `salah@…` fails sign-in with wrong credentials
 * - `belum@…` fails sign-in as an unverified email
 * - `terdaftar@…` cannot sign up (already registered)
 *
 * Never imported by app code: production always mounts the Supabase gateway.
 */
const localPart = (email: string) => email.trim().toLowerCase().split("@")[0] ?? "";

function startAccount(email: string) {
  const zone = deviceTimeZone();
  resetAccount();
  writingGroups.write(withoutSampleMe(writingGroups.read()));
  saveAccount({
    email,
    registered: true,
    memberSince: new Date().toISOString(),
    profile: {
      ...DEFAULT_ACCOUNT.profile,
      name: "",
      username: "",
      bio: "",
      genres: [],
      avatar: null,
      timeZone: zone,
      country: countryForZone(zone),
    },
  });
}

const taken = (email: string) => localPart(email) === "terdaftar";

export const memoryAuthGateway: AuthGateway = {
  async signIn(email) {
    const name = localPart(email);
    if (name === "salah") return { ok: false, reason: "credentials" };
    if (name === "belum") return { ok: false, reason: "unverified" };
    setViewer("masuk");
    return { ok: true, onboarded: true };
  },
  async signUp(email) {
    if (taken(email)) return { ok: false, reason: "exists" };
    startAccount(email);
    return { ok: true, verified: false };
  },
  async resendVerification() {
    return { ok: true };
  },
  async requestPasswordReset() {
    return { ok: true };
  },
  async updatePassword() {
    return { ok: true };
  },
  async changePassword() {
    return { ok: true };
  },
  async deleteAccount() {
    resetAccount();
    setViewer("tamu");
    return { ok: true };
  },
  async signOut() {
    setViewer("tamu");
  },
  emailTaken: taken,
  async continueWithGoogle(mode) {
    if (mode === "signUp") startAccount(DEFAULT_ACCOUNT.email);
    setViewer("masuk");
    return { onboarded: mode === "signIn" };
  },
};
