/**
 * The scene beside the account screens (DESIGN.md 6, layar akun; tahap J, 23 November 2026): a
 * public-domain painting filling the right half, with an engraving cut out of its paper crossing
 * the seam (after the Novlr sign-in, the user's reference). All files are from Wikimedia Commons,
 * resized in public/auth/; the paintings keep their colours. The banana engraving is kept as it is
 * (ink on its paper) with the paper outside its silhouette made transparent; the corner mangrove is
 * an alpha mask (ink opaque, paper transparent) painted with the `ink` token. No credits on the page
 * (same decision as the landing); sources here:
 *
 *   saleh-forest-house:     Raden Saleh, Forest and Native House (PD)
 *                           File:Forest_and_Native_House_by_Raden_Saleh.jpg
 *   saleh-javanese-jungle:  Raden Saleh, Javanese Jungle, Smithsonian American Art Museum (PD)
 *                           File:Raden_Saleh_-_Javanese_Jungle_-_1985.66.328,264_-_Smithsonian_American_Art_Museum.jpg
 *   rumphius-musa:          G. E. Rumphius, Herbarium Amboinense, Musa uranoscopos, 1741-1750 (PD)
 *                           File:Musa_uranoscopos_Rumphius.jpg
 *   rumphius-mangium:       G. E. Rumphius, Herbarium Amboinense, Mangium candelarium, Tab. LXXI (PD)
 *                           File:Herbarium_Amboinense_-_Mangium_candelarium_Tab_LXXI.png
 */
export type AuthArtName = "welcome" | "recover";

export type AuthScene = {
  painting: { src: string; width: number; height: number; focus: string };
  /** The engraving that crosses the seam. */
  cutout: { src: string; width: number; height: number };
};

const DIR = "/auth";

/** The small faded engraving in the form's corner, the same on every screen. */
export const CORNER_ENGRAVING = { ink: `${DIR}/rumphius-mangium.webp`, width: 417, height: 640 };

const MUSA = { src: `${DIR}/rumphius-musa.webp`, width: 507, height: 640 };

export const AUTH_SCENES: Record<AuthArtName, AuthScene> = {
  welcome: {
    painting: {
      src: `${DIR}/saleh-forest-house.webp`,
      width: 1600,
      height: 888,
      // The palm, the path and the walkers sit left of centre.
      focus: "38% 50%",
    },
    cutout: MUSA,
  },
  recover: {
    painting: {
      src: `${DIR}/saleh-javanese-jungle.webp`,
      width: 1600,
      height: 885,
      // The tall tree and the small figure on the path.
      focus: "55% 50%",
    },
    cutout: MUSA,
  },
};

/** Sign in and sign up open on the evening landscape; recovering, verifying and onboarding on the forest. */
export function artFor(pathname: string): AuthArtName {
  const segment = pathname.split("/")[1] ?? "";
  return segment === "masuk" || segment === "daftar" ? "welcome" : "recover";
}
