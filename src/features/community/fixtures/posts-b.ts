import type { FixturePost } from "./fixture-types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Posts 10-19, including one that only members of Grup Penulis Pesisir can read. */
export const postsB: FixturePost[] = [
  {
    id: "rumah-di-ujung-rel",
    authorId: "dimas-pratama",
    title: "Rumah di Ujung Rel",
    kind: "cuplikan",
    genre: "Cerpen",
    sourceTitle: "Jadwal Kereta Bapak",
    visibility: "publik",
    appreciations: 96,
    saves: 37,
    agoMs: 3 * DAY + 11 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Setiap kereta lewat, gelas di rak dapur bergeser setengah jari. Bapak sudah berhenti menggesernya kembali. Kami belajar membaca jadwal dari jarak gelas-gelas itu.",
      },
    ],
  },
  {
    id: "dua-puluh-menit-sebelum-subuh",
    authorId: "nur-aisyah",
    title: "Dua Puluh Menit Sebelum Subuh",
    kind: "cuplikan",
    genre: "Esai",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 31,
    saves: 11,
    agoMs: 1 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Menulis dua puluh menit sebelum subuh ternyata mengubah cara aku membaca hari. Kalimat-kalimat yang biasanya kabur jadi punya tepi. Besok aku coba lagi, mungkin dengan lampu yang lebih redup.",
      },
    ],
  },
  {
    id: "kata-yang-tidak-jujur",
    authorId: "aina-sofea",
    title: "Kata yang Tidak Jujur",
    kind: "cuplikan",
    genre: "Esai",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 64,
    saves: 26,
    agoMs: 1 * DAY + 14 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Kata “rindu” kupakai tiga kali dalam satu halaman, dan tidak satu pun terasa jujur. Kuganti dengan menyebut apa yang tertinggal di meja makan. Baru terasa.",
      },
    ],
  },
  {
    id: "garam-dan-pelabuhan",
    authorId: "hafiz-rahman",
    title: "Garam dan Pelabuhan",
    kind: "prolog",
    genre: "Esai",
    sourceTitle: "Tujuh Belas Kali Pindah Rumah",
    visibility: "grup",
    groupName: "Grup Penulis Pesisir",
    appreciations: 17,
    saves: 5,
    agoMs: 2 * DAY + 5 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Keluargaku pindah rumah tujuh belas kali sebelum aku lulus SMA, dan selalu mengikuti garis pantai. Ayah bilang laut adalah satu-satunya tetangga yang tidak pernah menagih uang sewa.",
      },
      {
        type: "paragraph",
        text: "Di grup ini aku ingin mulai menulis tentang semua pelabuhan itu, satu per satu, dari yang paling berbau solar sampai yang hanya punya dermaga kayu dan seekor kucing belang.",
      },
    ],
  },
  {
    id: "nasi-lemak-pukul-enam",
    authorId: "nadiah-roslan",
    title: "Nasi Lemak Pukul Enam",
    kind: "prolog",
    genre: "Memoar",
    sourceTitle: "Gerai Mak Su di Simpang Tiga",
    visibility: "publik",
    appreciations: 27,
    saves: 16,
    agoMs: 6 * DAY,
    blocks: [
      {
        type: "paragraph",
        text: "Mak Su membuka gerainya tepat ketika azan Subuh selesai, dan menutupnya sebelum matahari cukup tinggi untuk membuat sambal berminyak. Katanya, nasi lemak yang enak tidak perlu dijual lama.",
      },
      {
        type: "paragraph",
        text: "Aku mulai membantunya pada usia sebelas tahun, tugasku hanya satu: membungkus nasi dengan daun pisang, dua lipatan, tidak lebih. Lipatan ketiga, kata Mak Su, adalah tanda orang yang tidak percaya pada rezekinya sendiri.",
      },
    ],
  },
  {
    id: "kereta-malam-ke-bandung",
    authorId: "bayu-wicaksono",
    title: "Kereta Malam ke Bandung",
    kind: "cuplikan",
    genre: "Puisi",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 21,
    saves: 7,
    agoMs: 12 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Jendela mencatat sawah\ndengan tinta yang cepat kering.\nAku duduk menghadap arah datang,\nsupaya tidak melihat kota yang kutinggalkan.",
      },
    ],
  },
  {
    id: "penjaga-mercusuar",
    authorId: "bayu-wicaksono",
    title: "Buku Harian Penjaga Mercusuar",
    kind: "prolog",
    genre: "Novel",
    sourceTitle: "Buku Harian Penjaga Mercusuar",
    visibility: "publik",
    appreciations: 44,
    saves: 28,
    agoMs: 4 * DAY + 6 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Hari pertama. Mercusuar ini lebih tinggi dari yang kubayangkan, dan tangganya berputar ke arah yang salah. Atau mungkin aku yang terlalu lama tinggal di kota yang semua tangganya berputar ke kanan.",
      },
      {
        type: "paragraph",
        text: "Pak Haji, penjaga sebelumku, meninggalkan satu pesan di dinding ruang lampu: jangan menyalakan lampu sebelum yakin ada yang sedang mencari jalan pulang. Aku bertanya-tanya bagaimana caranya yakin.",
      },
    ],
  },
  {
    id: "teh-tarik-dan-tenggat",
    authorId: "farid-zulkifli",
    title: "Teh Tarik dan Tenggat",
    kind: "cuplikan",
    genre: "Esai",
    sourceTitle: null,
    visibility: "publik",
    appreciations: 15,
    saves: 4,
    agoMs: 3 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Tenggat naskahku jatuh hari Jumaat, dan satu-satunya hal yang sudah selesai ialah teh tarik di sebelah laptop. Dia sejuk sendiri. Aku mula curiga bahawa menulis ialah cara paling mahal untuk membiarkan minuman menjadi dingin.",
      },
    ],
  },
  {
    id: "sepeda-bapak",
    authorId: "laras",
    title: "Sepeda Bapak",
    kind: "prolog",
    genre: "Cerpen",
    sourceTitle: "Sepeda Bapak",
    visibility: "publik",
    appreciations: 36,
    saves: 21,
    hasImage: true,
    agoMs: 5 * DAY + 9 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Sepeda itu tidak pernah dikunci, dan tidak pernah hilang. Bapak percaya tidak ada pencuri yang cukup berani membawa pulang sesuatu yang bunyinya seperti pengumuman setiap kali pedalnya diinjak.",
      },
      {
        type: "paragraph",
        text: "Sampai pada suatu pagi bulan Agustus, sepeda itu berdiri di tempatnya seperti biasa, tetapi bel kecil di setangnya sudah tidak ada. Bapak memandanginya lama, lalu tersenyum, seolah-olah pencuri itu baru saja memberinya kabar baik.",
      },
    ],
  },
  {
    id: "daftar-belanja-terakhir-ibu",
    authorId: "siti-khadijah",
    title: "Daftar Belanja Terakhir Ibu",
    kind: "cuplikan",
    genre: "Memoar",
    sourceTitle: "Rumah Papan di Kampung Seri Gading",
    visibility: "publik",
    appreciations: 52,
    saves: 40,
    agoMs: 6 * DAY + 4 * HOUR,
    blocks: [
      {
        type: "paragraph",
        text: "Di saku baju kurung Mak, aku menemui sehelai kertas lusuh: bawang merah, kicap, ubat gigi, dan di baris paling bawah, tulisan yang lebih kecil, “telefon Siti.” Aku menangis di lorong sabun, bukan kerana kertas itu, tetapi kerana tulisannya masih begitu rapi.",
      },
    ],
  },
];
