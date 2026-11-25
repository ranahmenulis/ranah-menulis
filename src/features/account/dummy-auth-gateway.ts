import { setViewer } from "@/lib/viewer";
import { withoutSampleMe, writingGroups } from "@/features/community/groups/group-store";
import { DEFAULT_ACCOUNT, resetAccount, saveAccount } from "./account-store";
import type { AuthGateway } from "./auth-gateway";
import { simulateSignIn, simulateSignUp } from "./dummy-auth";
import { countryForZone, deviceTimeZone } from "./timezones";

/** A new, empty account on this device (the stand-in for creating one in Supabase Auth). */
function startAccount(email: string) {
  const zone = deviceTimeZone();
  resetAccount();
  // A new account starts without the sample circle membership and invitation of the dummy reader.
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

/**
 * Stand-in used when no real sign-in is mounted (component tests, a page rendered alone). Nothing
 * is checked against a server: see `dummy-auth.ts` for the addresses that show each state.
 */
export const dummyAuthGateway: AuthGateway = {
  simulated: true,
  async signIn(email) {
    const result = simulateSignIn(email);
    if (!result.ok) return result;
    setViewer("masuk");
    return { ok: true, onboarded: true };
  },
  async signUp(email) {
    if (!simulateSignUp(email).ok) return { ok: false, reason: "exists" };
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
  emailTaken: (email) => !simulateSignUp(email).ok,
  async continueWithGoogle(mode) {
    if (mode === "signUp") startAccount(DEFAULT_ACCOUNT.email);
    setViewer("masuk");
    return { onboarded: mode === "signIn" };
  },
};
