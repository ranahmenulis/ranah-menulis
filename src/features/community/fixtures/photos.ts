import type { PostImage } from "../types";

/**
 * Photos attached to fixture posts. All public domain or CC0, from the asset moodboard of
 * 20 November 2026; stored as WebP in their original colors in public/community/photos/. Sources:
 * - eddystone-lighthouse: Heath, Plymouth, c. 1898, commons.wikimedia.org/wiki/File:THE_EDDYSTONE_LIGHTHOUSE._ca._1898.jpg
 * - java-south-coast: Rijksmuseum lithograph, 1854 (CC0), File:Gezicht_de_zuidkust_van_Java,_RP-P-2018-1025.jpg
 * - sky-before-rain: John Constable, 1821, File:John_Constable_-_Cloud_Study_-_Google_Art_Project_(2443587).jpg
 * - rolling-clouds: John Constable, 1821, File:John_Constable_-_Cloud_Study_-_Google_Art_Project_(2427780).jpg
 * - handwritten-letter: Serafeim Xenopoulos, 1865, File:Serafeim_Xenopoulos_letter_1865.jpg
 * - remington-typewriter: U.S. Fish and Wildlife Service, File:Antique_Remington_typewriter_-_DPLA_-_2d0970de25ad0e1e4de9d2b410a36556.jpg
 * - mount-gede: F. W. Junghuhn, 1853, File:KITLV_-_50H7_-_Junghuhn,_Franz_Wilhelm_(1809-1864)_-_Mieling,_C.W._-_Gunong_Gedeh_(Gunung_Gede)_-_Colour_lithography_-_1853-1854.tif
 * - folded-letter: Leo Lesquereux, 1849, File:Correspondence_-_Lesquereux_(Leo)_and_Engelmann_(George)_(Feb_07,_1849_(1)_verso)_BHL43677647.jpg
 */
const photo = (name: string, width: number, height: number, alt: string): PostImage => ({
  src: `/community/photos/${name}.webp`,
  width,
  height,
  alt,
});

export const photos = {
  lighthouse: photo("eddystone-lighthouse", 900, 557, "Mercusuar di atas karang, laut tenang"),
  coast: photo("java-south-coast", 900, 680, "Pantai berkarang dengan ombak di kaki tebing"),
  skyBeforeRain: photo("sky-before-rain", 900, 686, "Langit penuh awan tebal sebelum hujan"),
  clouds: photo("rolling-clouds", 900, 747, "Awan bergulung di langit sore"),
  letter: photo("handwritten-letter", 648, 900, "Surat lama bertulisan tangan rapat"),
  typewriter: photo("remington-typewriter", 900, 598, "Mesin tik tua di atas meja"),
  mountain: photo("mount-gede", 900, 678, "Gunung berkabut di atas lembah dan sawah"),
  foldedLetter: photo("folded-letter", 652, 900, "Kertas surat terlipat dengan tulisan pudar"),
} as const;
