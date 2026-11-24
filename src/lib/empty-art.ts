/**
 * Plates for first-time empty states (DESIGN.md 9, phase 4a of the UI overhaul, 21 November 2026).
 * Taken from the asset moodboard (https://claude.ai/artifact/28b43Y3jyRYYq9fXDfStBV), choosing only
 * pictures not used anywhere else in the app or the landing. WebP in their original colours (user,
 * 21 November 2026), at most 560px, in public/empty/. Decorative: the sentence beside each plate carries the meaning. Sources, all on
 * Wikimedia Commons:
 *
 *   hikayat:         Hikayat Amir Hamzah in Makassarese script, copyist unknown (PD)
 *                    File:Hikayat_Amir_Hamzah_in_Makassarese.jpg
 *   readingTogether: John Everett Millais and Joseph Swain, Sister Anna's Probation, 1862 (PD)
 *                    File:Sister_Anna's_Probation_-_Precious_Book.jpg
 *   library:         Johann Boxbarth, library interior, c. 1700 (PD)
 *                    File:Boxbarth_after_Feuillet_Library_interior_c1700.jpg
 *   lighthouse:      Hamlet Winstanley, Eddystone Lighthouse, 1703 (CC0, Yale Center for British Art)
 *                    File:Hamlet_Winstanley_-_Eddystone_Lighthouse_-_B1977.14.14578_-_Yale_Center_for_British_Art.jpg
 *   engravingRoom:   National Photo Company, Lanman Engraving Co. interior, 1916 (PD)
 *                    File:Lanman_Engraving_Co._interior_LCCN2016826212.jpg
 *   womanWriting:    Joseph Swain after Millais, A weeping wife, 1860 (PD)
 *                    File:A_weeping_wife.jpg
 *   clouds:          Johan Christian Dahl, Study of Clouds over Fields, 1857 (PD)
 *                    File:Johan_Christian_Dahl_-_Study_of_Clouds_over_Fields_-_NG.M.00426-016_-_National_Museum_of_Art,_Architecture_and_Design.jpg
 *   wildRose:        Harry Roberts, The book of old-fashioned flowers, 1901 (no known restrictions)
 *                    File:The_book_of_old-fashioned_flowers_and_other_plants_which_thrive_in_the_open-air_of_England_(1901)_(20210909510).jpg
 */
export type EmptyArt = { src: string; width: number; height: number };

const DIR = "/empty";

export const EMPTY_ART = {
  /** Beranda, following nobody yet: a book of stories, open. */
  hikayat: { src: `${DIR}/hikayat-amir-hamzah.webp`, width: 560, height: 446 },
  /** Lingkar Menulis: two people reading one book. */
  readingTogether: { src: `${DIR}/reading-together.webp`, width: 560, height: 502 },
  /** Tersimpan. */
  library: { src: `${DIR}/library-1700.webp`, width: 560, height: 426 },
  /** Notifikasi. */
  lighthouse: { src: `${DIR}/eddystone-1703.webp`, width: 388, height: 560 },
  /** Proyek saya. */
  engravingRoom: { src: `${DIR}/lanman-engraving.webp`, width: 560, height: 440 },
  /** Dokumen: someone writing at a desk. */
  womanWriting: { src: `${DIR}/woman-writing.webp`, width: 560, height: 355 },
  /** Event. */
  clouds: { src: `${DIR}/dahl-clouds.webp`, width: 560, height: 396 },
  /** A profile with no works. */
  wildRose: { src: `${DIR}/wild-rose.webp`, width: 409, height: 560 },
} as const satisfies Record<string, EmptyArt>;

export type EmptyArtName = keyof typeof EMPTY_ART;
