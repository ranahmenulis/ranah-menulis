/**
 * The one public-domain plate left on the landing (user, 28 Nov 2026): an engraving of the
 * library of the London Institution, 1820, from Wikimedia Commons, layered behind the Studio
 * editor on the hero stage from md. The file in public/landing/ is cropped to the engraved
 * picture (no paper margin, no caption), resized to 1200px and saved as grayscale WebP; the
 * slate tint in light mode is CSS (`lp-plate` in globals.css). No credit on the page (client and
 * user decision, 20 Nov 2026); the source lives here.
 */
export const HERO_PLATE = {
  src: "/landing/london-library.webp",
  width: 1200,
  height: 806,
} as const;
