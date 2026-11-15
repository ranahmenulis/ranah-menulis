/**
 * Static help content (STD-11). No model is called. Prompts come from the design board
 * (docs/desain/aplikasi/Main.dc.html).
 * [konfirmasi] The starter lines under each kit are placeholder editorial text; the client or
 * editors own the final content of the inspiration kit.
 */

export const prompts = [
  "Tulis satu adegan ketika tokohmu menunggu sesuatu yang tidak pernah ia sebut namanya.",
  "Ceritakan sebuah rumah lewat satu bau yang masih tertinggal di dalamnya.",
  "Buka dengan kalimat yang diucapkan seseorang di dapur. Jangan jelaskan siapa dia sampai paragraf ketiga.",
  "Tulis surat untuk orang yang sudah pindah rumah, tanpa sekali pun memakai kata rindu.",
  "Pilih satu benda di mejamu dan tulis riwayatnya dari sudut pandang benda itu.",
];

export type Kit = { name: string; hint: string; entries: string[] };

export const kits: Kit[] = [
  {
    name: "Ide cerita",
    hint: "Premis singkat",
    entries: [
      "Seorang penjahit menemukan catatan ukuran tubuh milik orang yang tak pernah datang mengambil pesanannya.",
      "Dua saudara berbagi satu rumah warisan, tetapi hanya satu yang tahu ada ruangan terkunci di dalamnya.",
      "Pasar subuh di kota kecil punya aturan yang tak tertulis, dan seorang pendatang melanggarnya pada hari pertama.",
    ],
  },
  {
    name: "Kalimat pembuka",
    hint: "Untuk paragraf pertama",
    entries: [
      "Pintu itu tidak pernah dikunci, dan itulah yang membuat Ibu gelisah.",
      "Sebelum hujan, kampung kami selalu berbau besi.",
      "Aku baru tahu namanya setelah ia pergi.",
    ],
  },
  {
    name: "Kamus diksi",
    hint: "Padanan kata",
    entries: [
      "berjalan: melangkah, menyusuri, menapak, berkelana",
      "melihat: menatap, memandang, mengamati, menengok",
      "sedih: pilu, murung, lara, sendu",
    ],
  },
  {
    name: "Pertanyaan refleksi",
    hint: "Untuk tulisan pribadi",
    entries: [
      "Apa yang kamu tunda hari ini, dan apa yang sebenarnya kamu takutkan darinya?",
      "Siapa yang terakhir kali membuatmu merasa didengarkan?",
      "Kebiasaan kecil apa yang diam-diam menopang harimu?",
    ],
  },
  {
    name: "Ide judul",
    hint: "Pola judul",
    entries: [
      "[Benda] yang Ditinggalkan di [Tempat]",
      "Sebelum [Peristiwa]",
      "Cara [Tokoh] Menunggu",
    ],
  },
  {
    name: "Kalimat penutup",
    hint: "Untuk akhir bagian",
    entries: [
      "Lampu dapur masih menyala sampai pagi.",
      "Ia tidak menoleh, dan aku tidak memanggil.",
      "Di luar, hujan berhenti tanpa memberi tahu siapa pun.",
    ],
  },
  {
    name: "Kamus transisi",
    hint: "Penyambung antarparagraf",
    entries: [
      "waktu: sementara itu, tak lama kemudian, sejak saat itu",
      "kontras: namun, meski begitu, di sisi lain",
      "akibat: karena itu, akhirnya, sebagai gantinya",
    ],
  },
];
