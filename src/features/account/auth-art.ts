/**
 * The art beside the account screens (DESIGN.md 6, layar akun; 7.10): the letter and quill
 * (`LetterQuill`), "who you are", on every account screen. Two lines sit under it, chosen here:
 * one for signing in and up, the other for recovering, verifying and onboarding. The lines are in
 * the `account.plate` dictionary.
 */
export type AuthArtName = "welcome" | "recover";

/** Sign in and sign up open on one line; recovering, verifying and onboarding on the other. */
export function artFor(pathname: string): AuthArtName {
  const segment = pathname.split("/")[1] ?? "";
  return segment === "masuk" || segment === "daftar" ? "welcome" : "recover";
}
