/**
 * What the account screens ask of the sign-in system. Supabase Auth in the app
 * (`supabase-auth-gateway.ts`); component tests install an in-memory one (`src/test`). Screens never
 * call Supabase directly.
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

export type ChangePasswordResult =
  { ok: true } | { ok: false; reason: "credentials" | "same" | "password" | AuthFailure };

export type DeleteAccountResult = { ok: true } | { ok: false; reason: "failed" };

export type AuthGateway = {
  signIn(email: string, password: string): Promise<SignInResult>;
  /** `next` is where the reader was heading; it is kept through the email link. */
  signUp(email: string, password: string, next?: string | null): Promise<SignUpResult>;
  resendVerification(email: string, next?: string | null): Promise<SendResult>;
  requestPasswordReset(email: string): Promise<SendResult>;
  /** Needs the recovery session that the email link opens. */
  updatePassword(password: string): Promise<UpdatePasswordResult>;
  /** From Pengaturan: checks the current password first, then sets the new one. */
  changePassword(current: string, next: string): Promise<ChangePasswordResult>;
  /** Deletes the signed-in account for good (profile, roles, photo) and ends the session. */
  deleteAccount(): Promise<DeleteAccountResult>;
  signOut(): Promise<void>;
  /**
   * Only a test stand-in can know that an address is taken. A real system must not tell (it would
   * let anyone find who has an account), so this is absent there and Daftar learns it on submit.
   */
  emailTaken?(email: string): boolean;
  /** "With Google". Returns `null` when the browser redirects to the provider. */
  continueWithGoogle?(
    mode: "signIn" | "signUp",
    next?: string | null,
  ): Promise<{ onboarded: boolean } | null>;
};
