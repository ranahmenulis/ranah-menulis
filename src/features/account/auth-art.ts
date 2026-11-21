/**
 * The plate beside the account screens (DESIGN.md 6, layar akun; 21 November 2026): marbled
 * endpapers, the pages a book opens on before its text, as signing in opens the app. Taken from the
 * asset moodboard (https://claude.ai/artifact/28b43Y3jyRYYq9fXDfStBV), used nowhere else in the app
 * or the landing, WebP in their original colours in public/auth/. Decorative: the alt text is in the
 * `account.plate` dictionary. Sources, both on Wikimedia Commons:
 *
 *   welcome: Thomas Richards, marbled paper, 1869 (PD)
 *            File:Detail,_Marbled-paper-1869_(cropped).jpg
 *   recover: Unknown, blue and golden paper marbling, book back cover, Germany, c. 1880 (PD)
 *            File:Blue_and_golden_paper_marbling,_book_back_cover,_Germany,_around_1880_(cropped).jpg
 */
export type AuthArtName = "welcome" | "recover";

export type AuthArt = { src: string; width: number; height: number };

export const AUTH_ART: Record<AuthArtName, AuthArt> = {
  welcome: { src: "/auth/endpaper-1869.webp", width: 888, height: 900 },
  recover: { src: "/auth/endpaper-1880.webp", width: 732, height: 760 },
};

/** Sign in and sign up open on one paper; recovering, verifying and onboarding on the other. */
export function artFor(pathname: string): AuthArtName {
  const segment = pathname.split("/")[1] ?? "";
  return segment === "masuk" || segment === "daftar" ? "welcome" : "recover";
}
