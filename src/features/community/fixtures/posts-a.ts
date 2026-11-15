import type { FixturePost } from "./fixture-types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Posts 1-9. Times are "how long ago", resolved against the moment the page is opened. */
export const postsA: FixturePost[] = [
  {
    id: "hujan-pertama-bulan-november",
    authorId: "rinjani-putri",
    title: "Hujan Pertama Bulan November",
    kind: "prolog",
    genre: "Cerpen",
    sourceTitle: "Yang Ditunggu Nenek di Bawah Jambu Air",
    visibility: "publik",
    appreciations: 86,
    saves: 41,
    agoMs: 3 * DAY + 5 * HOUR,
    updatedAgoMs: 2 * DAY + 2 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk. Ia berdiri dulu di bawah jambu air, membiarkan beberapa tetes jatuh ke kerudungnya, seolah menunggu seseorang yang berjanji pulang bersama musim.",
      },
      {
        type: "paragraph",
        text: "Waktu kecil aku mengira Nenek sedang menghitung. Bibirnya bergerak pelan, dan setiap kali petir lewat di atas sawah, ia berhenti sebentar lalu mulai lagi dari awal. Ibu bilang itu doa. Kakek, yang jarang bicara, bilang itu bukan urusan anak-anak.",
      },
      {
        type: "paragraph",
        text: "Ada orang yang menunggu dengan duduk di beranda, memandangi ujung jalan sampai matanya perih. Nenek menunggu dengan basah. Ia pulang ke dapur dengan ujung kain yang menetes, menyalakan tungku, lalu menanak nasi lebih banyak dari yang sanggup kami habiskan.",
      },
      {
        type: "quote",
        text: "“Kalau dia pulang lapar, jangan sampai dia tahu kita lupa,” katanya suatu sore, kepada tungku, bukan kepadaku.",
      },
    ],
  },
  {
    id: "toples-kerupuk",
    authorId: "hafiz-rahman",
    title: "Toples Kerupuk",
    kind: "cuplikan",
    genre: "Puisi",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 48,
    saves: 22,
    agoMs: 6 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Ibu menyimpan laut\ndi dalam toples kerupuk:\nsetiap kali dibuka,\nrumah kami berbau pulang.",
      },
    ],
  },
  {
    id: "pasar-malam-selepas-hujan",
    authorId: "aina-sofea",
    title: "Pasar Malam Selepas Hujan",
    kind: "cuplikan",
    genre: "Cerpen",
    sourceTitle: "Pulang ke Jalan Raja Alang",
    visibility: "publik",
    appreciations: 67,
    saves: 30,
    hasImage: true,
    agoMs: 1 * DAY + 3 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Lampu-lampu gerai menyala satu per satu, dan bau air hujan bercampur asap sate. Mak Cik penjual kuih itu masih ingat namaku, walau sudah sepuluh tahun aku tidak pulang.",
      },
      {
        type: "paragraph",
        text: "“Kamu makin kurus,” katanya sambil menyelipkan dua keping kuih lapis ke dalam plastik. “Bayarnya nanti saja. Kalau kamu pulang lagi.”",
      },
    ],
  },
  {
    id: "resep-yang-tidak-pernah-ditulis",
    authorId: "laras",
    title: "Resep yang Tidak Pernah Ditulis",
    kind: "cuplikan",
    genre: "Esai",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 39,
    saves: 33,
    agoMs: 2 * DAY + 8 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Ibu tidak pernah menakar garam. Ia menakar dengan diam: berapa lama kami tidak saling bicara di meja makan, berapa banyak nasi yang kembali ke dapur.",
      },
    ],
  },
  {
    id: "bahasa-untuk-memarahi-adik",
    authorId: "nur-aisyah",
    title: "Bahasa yang Kupakai untuk Memarahi Adik",
    kind: "prolog",
    genre: "Esai",
    sourceTitle: "Dua Bahasa di Rumah Kami",
    visibility: "publik",
    appreciations: 112,
    saves: 58,
    agoMs: 1 * DAY + 9 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Di rumah kami ada dua bahasa: satu untuk tamu, satu untuk adik yang menghabiskan susu. Aku baru sadar keduanya sama-sama bahasa sayang setelah ia merantau ke Johor.",
      },
      {
        type: "paragraph",
        text: "Ibu tidak pernah mengajariku cara marah dengan baik. Yang kupunya hanya nada suara dan satu kalimat yang kuulang sampai adikku berhenti menangis dan mulai menghitung berapa kali aku mengucapkannya.",
      },
      {
        type: "paragraph",
        text: "Sekarang, setiap kali ia menelepon dari seberang selat, aku menunggu kalimat itu keluar dari mulutnya sendiri. Belum sekali pun. Ia lebih sering bertanya apakah aku sudah makan.",
      },
    ],
  },
  {
    id: "jam-dinding-kedai-kopi-ah-seng",
    authorId: "farid-zulkifli",
    title: "Jam Dinding di Kedai Kopi Ah Seng",
    kind: "prolog",
    genre: "Cerpen",
    sourceTitle: "Kopi O Kosong, Pukul Tujuh",
    visibility: "publik",
    appreciations: 54,
    saves: 19,
    agoMs: 2 * DAY + 1 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Jam itu lambat lima minit sejak tahun 1998, dan tiada pelanggan tetap yang mahu ia dibaiki. Kata Ah Seng, orang yang datang ke sini memang tidak tergesa-gesa.",
      },
      {
        type: "paragraph",
        text: "Setiap pagi Pak Samad duduk di meja dekat jendela, memesan kopi yang sama, lalu membandingkan jam dinding dengan arlojinya. Dia tidak pernah membetulkan sesiapa. Dia hanya mengangguk, seperti orang yang baru mengesahkan sesuatu.",
      },
    ],
  },
  {
    id: "probolinggo-pukul-lima",
    authorId: "maya-anindita",
    title: "Probolinggo, Pukul Lima",
    kind: "cuplikan",
    genre: "Puisi",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 31,
    saves: 12,
    agoMs: 9 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Kereta pertama lewat\nmembawa bau garam dan bawang merah.\nKota ini bangun\nsebelum sempat bermimpi.",
      },
    ],
  },
  {
    id: "surat-dari-lantai-dua-puluh",
    authorId: "dimas-pratama",
    title: "Surat dari Lantai Dua Puluh",
    kind: "prolog",
    genre: "Cerpen",
    sourceTitle: "Bapak Tidak Naik Lift",
    visibility: "publik",
    appreciations: 23,
    saves: 9,
    hasImage: true,
    agoMs: 4 * DAY,
    blocks: [
      {
        type: "paragraph",
        text: "Dari jendela kantor, Jakarta tampak seperti maket yang lupa dibereskan. Aku menulis surat ini di sela rapat, untuk Bapak yang seumur hidup tidak pernah naik lift.",
      },
      {
        type: "paragraph",
        text: "Bapak percaya bahwa tempat yang tidak bisa dicapai dengan menaiki tangga bukan tempat untuk orang yang jujur. Aku tidak membantah. Aku hanya menghitung lantai di dalam kepala, dan berhenti di angka sebelas, tempat napasku biasanya mulai berbohong.",
      },
    ],
  },
  {
    id: "anak-tangga-rumah-tok-wan",
    authorId: "siti-khadijah",
    title: "Anak Tangga Rumah Tok Wan",
    kind: "cuplikan",
    genre: "Memoar",
    sourceTitle: "Rumah Papan di Kampung Seri Gading",
    visibility: "publik",
    appreciations: 18,
    saves: 14,
    agoMs: 5 * DAY + 2 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Rumah Tok Wan punya tujuh anak tangga, dan setiap satu berbunyi lain. Kami belajar membaca suasana hati orang dewasa dari bunyi tangga yang mereka pijak.",
      },
      {
        type: "paragraph",
        text: "Anak tangga keempat berkeriut panjang kalau Abah pulang lewat Maghrib. Anak tangga keenam hanya berbunyi kalau Mak membawa kabar yang belum mahu dikongsikan.",
      },
    ],
  },
];
