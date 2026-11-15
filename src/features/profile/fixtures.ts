/**
 * Dummy profile details until accounts exist (R1). Name, handle, country, and city live with the
 * Community authors; this holds what only a profile shows. Genres are not stored: they come from
 * the author's own posts.
 */
export type ProfileFixture = {
  bio: string;
  /** People following the author, not counting the dummy reader. */
  followers: number;
  following: number;
  /** Days in a row. Only authors who chose to show it have one; private is the default (Brief). */
  streak?: number;
};

export const profiles: Record<string, ProfileFixture> = {
  "rinjani-putri": {
    bio: "Menulis cerpen dan esai tentang rumah, hujan, dan orang-orang yang menunggu.",
    followers: 38,
    following: 0,
  },
  "hafiz-rahman": {
    bio: "Dari Tanjung Priok. Menulis puisi pendek tentang laut, garam, dan kapal yang selalu pulang terlambat.",
    followers: 412,
    following: 96,
    streak: 21,
  },
  "nur-aisyah": {
    bio: "Esais. Belajar menulis dari surat-surat Ibu dan buku harian adik.",
    followers: 268,
    following: 133,
  },
  "dimas-pratama": {
    bio: "Cerpenis dari Probolinggo. Suka kisah kecil di sudut terminal dan stasiun.",
    followers: 187,
    following: 54,
    streak: 9,
  },
  laras: {
    bio: "Menulis puisi dan catatan harian. Satu nama saja cukup.",
    followers: 95,
    following: 40,
  },
  "maya-anindita": {
    bio: "Pembaca yang akhirnya ikut menulis. Menyukai kalimat pendek.",
    followers: 64,
    following: 71,
  },
  "bayu-wicaksono": {
    bio: "Menulis memoar tentang Bapak, sepeda, dan bengkel kecil di ujung gang.",
    followers: 143,
    following: 62,
  },
  "aina-sofea": {
    bio: "Dari Kuala Lumpur. Menulis dalam dua bahasa, kadang dalam satu kalimat.",
    followers: 530,
    following: 88,
    streak: 45,
  },
  "farid-zulkifli": {
    bio: "Dari Pulau Pinang. Menulis cerpen tentang rumah tua dan makanan yang diingat lidah.",
    followers: 221,
    following: 77,
  },
  "siti-khadijah": {
    bio: "Dari Johor Bahru. Menulis esai tentang bahasa ibu dan dapur nenek.",
    followers: 176,
    following: 59,
  },
  "nadiah-roslan": {
    bio: "Dari Kota Bharu. Menulis puisi di sela jam kerja.",
    followers: 82,
    following: 35,
  },
};
