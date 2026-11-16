export const SIGN_IN_HREF = "/masuk";
export const SIGN_UP_HREF = "/daftar";
export const FORGOT_HREF = "/lupa-sandi";
export const RESET_HREF = "/atur-ulang-sandi";
export const VERIFY_HREF = "/verifikasi";
export const ONBOARDING_HREF = "/mulai";
export const SETTINGS_HREF = "/pengaturan";
export const AFTER_AUTH_HREF = "/beranda";

/** Query key that carries where to go once the reader has signed in. */
export const NEXT_PARAM = "lanjut";

/**
 * A destination from the address bar is only used when it stays inside the app: a single leading
 * slash, no scheme, no protocol-relative `//`, and no backslash (some browsers read `/\` as `//`).
 * Account screens are never a destination, so signing in cannot loop back to a sign-in form.
 */
export function safeNext(raw: string | null | undefined, fallback = AFTER_AUTH_HREF): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  if (Array.from(raw).some((char) => char.charCodeAt(0) < 32)) return fallback;
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, "");
  const accountRoutes = [
    SIGN_IN_HREF,
    SIGN_UP_HREF,
    FORGOT_HREF,
    RESET_HREF,
    VERIFY_HREF,
    ONBOARDING_HREF,
  ];
  return accountRoutes.includes(path) ? fallback : raw;
}

/**
 * `/masuk?lanjut=%2Fprojects%2Fx`: an account screen that remembers where the reader was going.
 * `extra` adds other query values (a `status`) after it.
 */
export function withNext(
  href: string,
  next: string | null | undefined,
  extra: Record<string, string> = {},
): string {
  const params = new URLSearchParams();
  const safe = safeNext(next, "");
  if (safe) params.set(NEXT_PARAM, safe);
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  const query = params.toString();
  return query ? `${href}?${query}` : href;
}
