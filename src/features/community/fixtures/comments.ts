import type { FixtureComment } from "./fixture-types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Dummy comments. Counts shown on tiles and pages are derived from this list, so they always
 * agree with what a reader can open. Posts without an entry have no comments yet.
 */
export const fixtureComments: FixtureComment[] = [
  {
    id: "c-hujan-1",
    postId: "hujan-pertama-bulan-november",
    authorId: "maya-anindita",
    parentId: null,
    text: "Kalimat “Nenek menunggu dengan basah” membuatku berhenti lama. Tidak perlu dijelaskan lagi.",
    agoMs: 2 * HOUR,
  },
  {
    id: "c-hujan-1a",
    postId: "hujan-pertama-bulan-november",
    authorId: "rinjani-putri",
    parentId: "c-hujan-1",
    text: "Terima kasih, Maya. Kalimat itu yang paling lama kutulis ulang.",
    agoMs: 1 * HOUR,
  },
  {
    id: "c-hujan-1b",
    postId: "hujan-pertama-bulan-november",
    authorId: "hafiz-rahman",
    parentId: "c-hujan-1",
    text: "Bagian Nenek menanak nasi lebih banyak juga. Aku jadi ingin tahu untuk siapa nasi itu.",
    agoMs: 40 * MINUTE,
  },
  {
    id: "c-hujan-1c",
    postId: "hujan-pertama-bulan-november",
    authorId: "laras",
    parentId: "c-hujan-1",
    text: "Aku ikut berdiri di bawah jambu air itu sampai paragraf terakhir.",
    agoMs: 30 * MINUTE,
  },
  {
    id: "c-hujan-1d",
    postId: "hujan-pertama-bulan-november",
    authorId: "maya-anindita",
    parentId: "c-hujan-1",
    mention: "laras",
    text: "@laras sama. Aku sampai mencari jambu air di halaman rumah sendiri.",
    agoMs: 12 * MINUTE,
  },
  {
    id: "c-hujan-2",
    postId: "hujan-pertama-bulan-november",
    authorId: "aina-sofea",
    parentId: null,
    text: "Nenek saya pun begitu, cuma dia menunggu di tangga, bukan di bawah pokok. Rasa macam baca cerita keluarga sendiri.",
    agoMs: 5 * HOUR,
  },
  {
    id: "c-hujan-3",
    postId: "hujan-pertama-bulan-november",
    authorId: "farid-zulkifli",
    parentId: null,
    text: "Prolog yang tidak tergesa-gesa. Paragraf kedua terasa seperti ingatan yang sengaja dibiarkan kabur.",
    agoMs: 1 * DAY,
  },
  {
    id: "c-hujan-4",
    postId: "hujan-pertama-bulan-november",
    authorId: "nur-aisyah",
    parentId: null,
    text: "Kutipan terakhir itu cukup untuk membuatku ingin membaca seluruh ceritanya. Kapan terbit utuh?",
    agoMs: 1 * DAY + 6 * HOUR,
  },
  {
    id: "c-hujan-5",
    postId: "hujan-pertama-bulan-november",
    authorId: "dimas-pratama",
    parentId: null,
    text: "Menanak nasi lebih banyak dari yang sanggup dihabiskan. Detail kecil yang menjelaskan seluruh keluarga.",
    agoMs: 2 * DAY,
  },
  {
    id: "c-bahasa-1",
    postId: "bahasa-untuk-memarahi-adik",
    authorId: "hafiz-rahman",
    parentId: null,
    text: "Kalimat tentang ia yang lebih sering bertanya apakah kamu sudah makan itu jujur sekali.",
    agoMs: 7 * HOUR,
  },
  {
    id: "c-bahasa-2",
    postId: "bahasa-untuk-memarahi-adik",
    authorId: "maya-anindita",
    parentId: null,
    text: "Aku juga punya dua bahasa di rumah, dan baru sadar setelah membaca ini.",
    agoMs: 4 * HOUR,
  },
  {
    id: "c-bahasa-2a",
    postId: "bahasa-untuk-memarahi-adik",
    authorId: "nur-aisyah",
    parentId: "c-bahasa-2",
    text: "Terima kasih sudah membaca, Maya.",
    agoMs: 3 * HOUR,
  },
  {
    id: "c-toples-1",
    postId: "toples-kerupuk",
    authorId: "laras",
    parentId: null,
    text: "Baris terakhirnya membuatku ingat toples kerupuk di rumah Nenek.",
    agoMs: 4 * HOUR,
  },
  {
    id: "c-toples-2",
    postId: "toples-kerupuk",
    authorId: "bayu-wicaksono",
    parentId: null,
    text: "Empat baris, dan kamu sudah membawa pulang satu keluarga.",
    agoMs: 2 * HOUR,
  },
  {
    id: "c-pasar-1",
    postId: "pasar-malam-selepas-hujan",
    authorId: "siti-khadijah",
    parentId: null,
    text: "Bahagian kuih lapis itu buat saya senyum sendiri di komuter pagi tadi.",
    agoMs: 8 * HOUR,
  },
];
