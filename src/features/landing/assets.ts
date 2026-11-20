/**
 * Public-domain plates on the landing (moodboard: https://claude.ai/artifact/28b43Y3jyRYYq9fXDfStBV,
 * all from Wikimedia Commons). Files are grayscale WebP in public/landing/assets/, resized from the
 * originals and otherwise untouched; the monochrome look and the dark-mode treatment are CSS
 * (`lp-photo`, `lp-plate` in globals.css). There are no captions or credits on the page (client and
 * user decision, 20 Nov 2026); the sources live here.
 *
 *   londonLibrary: engraving of the library of the London Institution (hero)
 *   holbeinHand:   Hans Holbein the Younger, study of the hands of Erasmus writing (Studio)
 *   printRoom:     a printing room, 1914 (Publishing, behind the three covers)
 *   keladi:        caladium engraving, The American Florist, 1886 (FAQ)
 *   moonClouds:    Baade, moonlit clouds (closing band)
 */
export type LandingImage = { src: string; width: number; height: number };

const DIR = "/landing/assets";

export const LANDING_IMAGES = {
  londonLibrary: { src: `${DIR}/london-library.webp`, width: 1600, height: 1236 },
  holbeinHand: { src: `${DIR}/holbein-hand.webp`, width: 336, height: 450 },
  printRoom: { src: `${DIR}/print-room.webp`, width: 1400, height: 1055 },
  keladi: { src: `${DIR}/keladi.webp`, width: 600, height: 644 },
  moonClouds: { src: `${DIR}/moon-clouds.webp`, width: 1600, height: 938 },
} as const satisfies Record<string, LandingImage>;
