/**
 * What the account screens ask of the sign-in system. Supabase Auth in the app
 * (`supabase-auth-gateway.ts`); a stand-in that only simulates (`dummy-auth-gateway.ts`) when no
 * provider is mounted, which is what the component tests use. Screens never call Supabase directly.
 */
export type AuthFailure = "limit" | "network";

export type SignInResult =
  | { ok: true; onboarded: boolean }
  | { ok: false; reason: "credentials" | "unverified" | AuthFailure };

export type SignUpResult =
  /** `verified` is true when no email step is needed and the user is already signed in. */
  { ok: true; verified: boolean } | { ok: false; reason: "exists" | "password" | AuthFailure };

export type SendResult = { ok: true } | { ok: false; reason: AuthFailure };

export type UpdatePasswordResult =
  { ok: true } | { ok: false; reason: "expired" | "same" | "password" | AuthFailure };

export type AuthGateway = {
  /** True while sign-in is only simulated: the screens then show their stand-in buttons. */
  simulated: boolean;
  signIn(email: string, password: string): Promise<SignInResult>;
  /** `next` is where the reader was heading; it is kept through the email link. */
  signUp(email: string, password: string, next?: string | null): Promise<SignUpResult>;
  resendVerification(email: string, next?: string | null): Promise<SendResult>;
  requestPasswordReset(email: string): Promise<SendResult>;
  /** Needs the recovery session that the email link opens. */
  updatePassword(password: string): Promise<UpdatePasswordResult>;
  signOut(): Promise<void>;
  /**
   * Only the stand-in can know that an address is taken. A real system must not tell (it would
   * let anyone find who has an account), so this is absent there and Daftar learns it on submit.
   */
  emailTaken?(email: string): boolean;
  /** "With Google". Absent until real Google sign-in exists (Fase 5): the button is then hidden. */
  continueWithGoogle?(mode: "signIn" | "signUp"): Promise<{ onboarded: boolean }>;
};
